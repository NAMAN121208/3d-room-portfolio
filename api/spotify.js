// /api/spotify.js
// Placeholder for Spotify serverless function (owned by Codex - Phase 7)
export default async function handler(req, res) {
  res.status(200).json({
    isPlaying: false,
    nowPlaying: null,
    topTracks: [],
    topArtists: [],
    fetchedAt: new Date().toISOString()
  });
}
