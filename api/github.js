// /api/github.js
// Placeholder for GitHub serverless function (owned by Codex - Phase 6)
export default async function handler(req, res) {
  res.status(200).json({
    profile: null,
    pinnedRepos: [],
    contributions: { total: 0, weeks: [] },
    fetchedAt: new Date().toISOString()
  });
}
