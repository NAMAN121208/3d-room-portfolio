import test from "node:test";
import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { once } from "node:events";
import { stops } from "../src/content.js";
import { validateContent, validateSceneMeshes } from "../src/utils/validateContent.js";
import github from "../api/github.js";
import spotify from "../api/spotify.js";

async function invoke(handler, method = "GET") {
  const res = { headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; }, end() { return this; } };
  await handler({ method }, res);
  return res;
}
function setup(t, fetcher) {
  for (const key of ["GITHUB_TOKEN", "GITHUB_USERNAME", "SPOTIFY_CLIENT_ID", "SPOTIFY_CLIENT_SECRET", "SPOTIFY_REFRESH_TOKEN"]) {
    const old = process.env[key];
    process.env[key] = `test-${key}`;
    t.after(() => { if (old === undefined) delete process.env[key]; else process.env[key] = old; });
  }
  t.mock.method(globalThis, "fetch", fetcher);
}
const json = (body, status = 200) => new Response(JSON.stringify(body), { status });
const emptySpotify = (body) => {
  assert.deepEqual(Object.keys(body), ["isPlaying", "nowPlaying", "topTracks", "topArtists", "fetchedAt"]);
  assert.equal(body.isPlaying, false);
  assert.deepEqual(body.nowPlaying, { title: "", artist: "", albumArt: "", url: "" });
  assert.deepEqual(body.topTracks, []);
  assert.deepEqual(body.topArtists, []);
  assert.ok(Number.isFinite(Date.parse(body.fetchedAt)));
};

test("content has the eight ordered stops and validates", () => {
  assert.deepEqual(stops.map((s) => s.id), ["intro", "monitor", "laptop", "headphones", "sketchbook", "football", "jersey", "bookshelf"]);
  assert.deepEqual(validateContent(stops, () => assert.fail("Unexpected warning")), []);
  assert.ok(stops[0].title.includes("<name>"));
});
test("validation catches missing fields, duplicates, bad vectors, and missing model names", () => {
  const broken = structuredClone(stops);
  delete broken[1].title;
  broken[2].id = "monitor";
  broken[3].lookAt = [NaN, 1, 2];
  assert.ok(validateContent(broken, () => {}).length >= 3);
  const warnings = [];
  const scene = { getObjectByName: (name) => name === "Monitor" ? {} : undefined };
  const missing = validateSceneMeshes(stops, scene, (message) => warnings.push(message));
  assert.equal(missing.length, 6);
  assert.ok(warnings[0].includes('"Laptop"'));
  assert.deepEqual(validateSceneMeshes(stops, { getObjectByName: () => ({}) }), []);
});
test("missing credentials return contract-shaped empty data without network calls", async (t) => {
  setup(t, () => assert.fail("No request expected"));
  delete process.env.GITHUB_TOKEN;
  delete process.env.SPOTIFY_REFRESH_TOKEN;
  const gh = await invoke(github);
  assert.equal(gh.code, 200);
  assert.deepEqual(gh.body.contributions, { total: 0, weeks: [] });
  assert.ok(gh.body.profile.url.startsWith("https://github.com/"));
  assert.match(gh.headers["Cache-Control"], /s-maxage=900/);
  const sp = await invoke(spotify);
  emptySpotify(sp.body);
  assert.match(sp.headers["Cache-Control"], /s-maxage=60/);
});
test("GitHub maps public data, retains partial GraphQL data, and excludes private pins", async (t) => {
  setup(t, async (url, options) => {
    assert.equal(url, "https://api.github.com/graphql");
    assert.ok(options.signal);
    assert.equal(JSON.parse(options.body).variables.login, "test-GITHUB_USERNAME");
    return json({ errors: [{ message: "partial" }], data: { user: {
      name: "Owner", avatarUrl: "avatar", url: "profile", followers: { totalCount: 2 },
      pinnedItems: { nodes: [{ name: "public", isPrivate: false, stargazerCount: 4 }, { name: "private", isPrivate: true }, null] },
      contributionsCollection: { contributionCalendar: { totalContributions: 3, weeks: [{ contributionDays: [{ date: "2026-10-19", contributionCount: 3 }] }] } },
    } } });
  });
  const { body } = await invoke(github);
  assert.deepEqual(Object.keys(body), ["profile", "pinnedRepos", "contributions", "fetchedAt"]);
  assert.deepEqual(body.pinnedRepos, [{ name: "public", description: "", stars: 4, language: "", url: "" }]);
  assert.deepEqual(body.contributions, { total: 3, weeks: [{ days: [{ date: "2026-10-19", count: 3 }] }] });
  assert.equal(body.profile.followers, 2);
});
test("Spotify maps playing data and keeps successful results when one endpoint is blocked", async (t) => {
  const item = { type: "track", name: "Song", artists: [{ name: "Artist" }], album: { images: [{ url: "art" }] }, external_urls: { spotify: "track-link" } };
  setup(t, async (url, options) => {
    assert.ok(options.signal);
    if (url.endsWith("/api/token")) return json({ access_token: "test-access" });
    if (url.includes("currently-playing")) return json({ is_playing: true, item });
    if (url.includes("top/tracks")) return json({ items: [item] });
    return json({}, 403);
  });
  const { body } = await invoke(spotify);
  assert.equal(body.isPlaying, true);
  assert.deepEqual(body.nowPlaying, { title: "Song", artist: "Artist", albumArt: "art", url: "track-link" });
  assert.deepEqual(body.topTracks, [body.nowPlaying]);
  assert.deepEqual(body.topArtists, []);
  assert.ok(!JSON.stringify(body).includes("test-access"));
});
test("Spotify handles no playback and artist data with missing fields", async (t) => {
  setup(t, async (url) => {
    if (url.endsWith("/api/token")) return json({ access_token: "test-access" });
    if (url.includes("currently-playing")) return new Response(null, { status: 204 });
    if (url.includes("top/artists")) return json({ items: [{ name: "Artist" }] });
    return json({}, 429);
  });
  const { body } = await invoke(spotify);
  assert.equal(body.isPlaying, false);
  assert.equal(body.nowPlaying.title, "");
  assert.deepEqual(body.topArtists, [{ name: "Artist", image: "", url: "" }]);
});
test("upstream failures, malformed JSON and timeouts never become 500s", async (t) => {
  let mode = "network";
  setup(t, async () => {
    if (mode === "network") throw new Error("sensitive upstream error");
    if (mode === "timeout") throw new DOMException("Timeout", "TimeoutError");
    if (mode === "json") return new Response("not json");
    return json({}, 401);
  });
  for (mode of ["network", "timeout", "json", "unauthorized"]) {
    const gh = await invoke(github);
    assert.equal(gh.code, 200);
    assert.deepEqual(gh.body.pinnedRepos, []);
    const sp = await invoke(spotify);
    assert.equal(sp.code, 200);
    emptySpotify(sp.body);
  }
});
test("non-GET methods are rejected without fetching", async (t) => {
  setup(t, () => assert.fail("No request expected"));
  for (const handler of [github, spotify]) {
    const res = await invoke(handler, "POST");
    assert.equal(res.code, 405);
    assert.equal(res.headers.Allow, "GET");
    assert.equal(res.headers["Cache-Control"], "no-store");
  }
});
test("OAuth local callback rejects invalid state, then handles owner denial", { timeout: 10000 }, async (t) => {
  const child = spawn(process.execPath, ["scripts/get-spotify-token.js"], {
    cwd: new URL("../", import.meta.url),
    env: { ...process.env, SPOTIFY_CLIENT_ID: "test-client", SPOTIFY_CLIENT_SECRET: "test-secret" },
    stdio: ["ignore", "pipe", "pipe"],
  });
  t.after(() => child.kill());
  const exited = once(child, "exit");
  const output = await new Promise((resolve, reject) => {
    let out = "";
    child.stdout.on("data", (chunk) => { out += chunk; if (out.includes("https://accounts.spotify.com/authorize?")) resolve(out); });
    child.on("error", reject);
    child.on("exit", () => reject(new Error("OAuth process exited before listening")));
  });
  const authorize = new URL(output.trim().split("\n").at(-1));
  assert.equal(authorize.searchParams.get("redirect_uri"), "http://127.0.0.1:8888/callback");
  assert.ok(authorize.searchParams.get("scope").includes("user-read-recently-played"));
  const bad = await fetch("http://127.0.0.1:8888/callback?state=wrong&code=fake");
  assert.equal(bad.status, 400);
  await bad.text();
  const denied = await fetch(`http://127.0.0.1:8888/callback?state=${authorize.searchParams.get("state")}&error=access_denied`);
  assert.equal(denied.status, 400);
  await denied.text();
  assert.equal((await exited)[0], 1);
});
