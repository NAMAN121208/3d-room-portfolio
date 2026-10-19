const query = `query Portfolio($login: String!) {
  user(login: $login) {
    name avatarUrl url followers { totalCount }
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes { ... on Repository { name description stargazerCount url isPrivate primaryLanguage { name } } }
    }
    contributionsCollection {
      contributionCalendar { totalContributions weeks { contributionDays { date contributionCount } } }
    }
  }
}`;
const text = (value) => typeof value === "string" ? value : "";
const number = (value) => Number.isFinite(value) && value >= 0 ? value : 0;
const list = (value) => Array.isArray(value) ? value : [];

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    res.setHeader("Cache-Control", "no-store");
    return res.status(405).end();
  }
  const login = process.env.GITHUB_USERNAME?.trim() || "";
  const result = {
    profile: { name: "", avatar: "", followers: 0, url: login ? `https://github.com/${encodeURIComponent(login)}` : "" },
    pinnedRepos: [], contributions: { total: 0, weeks: [] }, fetchedAt: new Date().toISOString(),
  };
  // Shared CDN cache, while browsers revalidate on each visit.
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=900");
  if (!login || !process.env.GITHUB_TOKEN) return res.status(200).json(result);
  try {
    const response = await fetch("https://api.github.com/graphql", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.GITHUB_TOKEN}`, "Content-Type": "application/json", "User-Agent": "3d-room-portfolio" },
      body: JSON.stringify({ query, variables: { login } }), signal: AbortSignal.timeout(7000),
    });
    if (!response.ok) return res.status(200).json(result);
    const payload = await response.json();
    const user = payload?.data?.user;
    if (user) {
      result.profile = { name: text(user.name), avatar: text(user.avatarUrl), followers: number(user.followers?.totalCount), url: text(user.url) || result.profile.url };
      // Never expose private pins, even if an overly broad token is configured.
      result.pinnedRepos = list(user.pinnedItems?.nodes).filter((repo) => repo && repo.isPrivate === false).map((repo) => ({
        name: text(repo.name), description: text(repo.description), stars: number(repo.stargazerCount),
        language: text(repo.primaryLanguage?.name), url: text(repo.url),
      }));
      const calendar = user.contributionsCollection?.contributionCalendar;
      result.contributions = { total: number(calendar?.totalContributions), weeks: list(calendar?.weeks).map((week) => ({
        days: list(week?.contributionDays).map((day) => ({ date: text(day?.date), count: number(day?.contributionCount) })),
      })) };
    }
  } catch {
    // Deliberately do not log upstream payloads or credentials.
  }
  return res.status(200).json(result);
}
