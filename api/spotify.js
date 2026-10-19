const text = (value) => typeof value === "string" ? value : "";
const list = (value) => Array.isArray(value) ? value : [];
const track = (item) => ({
  title: text(item?.name), artist: list(item?.artists).map((artist) => text(artist?.name)).filter(Boolean).join(", "),
  albumArt: text(item?.album?.images?.[0]?.url), url: text(item?.external_urls?.spotify),
});

async function readSpotify(path, accessToken) {
  try {
    const response = await fetch(`https://api.spotify.com/v1/${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` }, signal: AbortSignal.timeout(3500),
    });
    // Includes no playback (204), blocked endpoints (403), and rate limits (429).
    if (!response.ok || response.status === 204) return null;
    return await response.json();
  } catch { return null; }
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.setHeader("Cache-Control", "no-store");
    return res.status(405).end();
  }
  const result = { isPlaying: false, nowPlaying: track(null), topTracks: [], topArtists: [], fetchedAt: new Date().toISOString() };
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=60");
  const { SPOTIFY_CLIENT_ID: clientId, SPOTIFY_CLIENT_SECRET: clientSecret, SPOTIFY_REFRESH_TOKEN: refreshToken } = process.env;
  if (!clientId || !clientSecret || !refreshToken) return res.status(200).json(result);
  try {
    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: { Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }), signal: AbortSignal.timeout(3500),
    });
    if (!response.ok) return res.status(200).json(result);
    const token = await response.json();
    if (!text(token?.access_token)) return res.status(200).json(result);
    // Current user's top items remain documented; artist/{id}/top-tracks is not used.
    // Docs checked 2026-10-19: https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide
    const [playing, tracks, artists] = await Promise.all([
      readSpotify("me/player/currently-playing", token.access_token),
      readSpotify("me/top/tracks?limit=6&time_range=medium_term", token.access_token),
      readSpotify("me/top/artists?limit=6&time_range=medium_term", token.access_token),
    ]);
    if (playing?.item?.type === "track") {
      result.isPlaying = playing.is_playing === true;
      result.nowPlaying = track(playing.item);
    }
    result.topTracks = list(tracks?.items).filter(Boolean).map(track);
    result.topArtists = list(artists?.items).filter(Boolean).map((artist) => ({
      name: text(artist.name), image: text(artist.images?.[0]?.url), url: text(artist.external_urls?.spotify),
    }));
  } catch {
    // Keep the exact response contract on auth, network, or malformed JSON failures.
  }
  return res.status(200).json(result);
}
