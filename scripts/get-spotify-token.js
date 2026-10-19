import { createServer } from "node:http";
import { randomBytes, timingSafeEqual } from "node:crypto";

// Node 22+: node --env-file=.env scripts/get-spotify-token.js
// Register this EXACT redirect URI in the Spotify app dashboard first.
const redirectUri = "http://127.0.0.1:8888/callback";
const { SPOTIFY_CLIENT_ID: clientId, SPOTIFY_CLIENT_SECRET: clientSecret } = process.env;

if (!clientId || !clientSecret) {
  console.error("Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in your local .env first.");
  process.exitCode = 1;
} else {
  const state = randomBytes(32).toString("hex");
  const authorizationUrl = new URL("https://accounts.spotify.com/authorize");
  authorizationUrl.search = new URLSearchParams({
    client_id: clientId, response_type: "code", redirect_uri: redirectUri, state,
    scope: "user-read-currently-playing user-top-read user-read-recently-played",
  }).toString();
  let consumed = false;
  let timeout;
  const finish = (code) => {
    clearTimeout(timeout);
    process.exitCode = code;
    server.close();
  };
  const server = createServer(async (req, res) => {
    res.setHeader("Content-Type", "text/plain; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("Referrer-Policy", "no-referrer");
    const url = new URL(req.url, redirectUri);
    if (url.pathname !== "/callback") { res.writeHead(404).end("Not found."); return; }
    if (req.method !== "GET") { res.writeHead(405, { Allow: "GET" }).end(); return; }
    const suppliedState = Buffer.from(url.searchParams.get("state") || "");
    const expectedState = Buffer.from(state);
    if (suppliedState.length !== expectedState.length || !timingSafeEqual(suppliedState, expectedState)) {
      res.writeHead(400).end("Invalid OAuth state. Use the original terminal link."); return;
    }
    if (consumed) { res.writeHead(409).end("This authorization was already handled."); return; }
    consumed = true;
    if (url.searchParams.has("error") || !url.searchParams.get("code")) {
      res.writeHead(400).end("Authorization was denied or no code was returned. Run the script again.");
      console.error("Spotify authorization did not complete."); finish(1); return;
    }
    try {
      const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: { Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ grant_type: "authorization_code", code: url.searchParams.get("code"), redirect_uri: redirectUri }),
        signal: AbortSignal.timeout(10000),
      });
      if (!response.ok) throw new Error("Token exchange failed");
      const token = await response.json();
      if (typeof token?.refresh_token !== "string" || !token.refresh_token) throw new Error("Missing refresh token");
      // This explicit, local-only output is the sole intentional credential output.
      console.log(`SPOTIFY_REFRESH_TOKEN=${token.refresh_token}`);
      res.end("Setup complete. Copy the refresh token from your terminal into .env and Vercel environment variables.");
      finish(0);
    } catch {
      console.error("Spotify token exchange failed. Check app credentials and redirect URI, then retry.");
      res.writeHead(502).end("Token exchange failed. See the terminal and retry."); finish(1);
    }
  });
  server.on("error", () => { console.error("Could not start the callback server. Make sure port 8888 is free."); finish(1); });
  server.listen(8888, "127.0.0.1", () => {
    console.log(`Open this URL in your browser and sign in as the portfolio owner:\n${authorizationUrl}`);
    timeout = setTimeout(() => { console.error("Authorization timed out. Run the script again."); finish(1); }, 5 * 60 * 1000);
  });
}
