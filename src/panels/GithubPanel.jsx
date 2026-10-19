// src/panels/GithubPanel.jsx
// Monitor stop detail panel: GitHub profile, contributions heatmap, pinned repos, and skills
// Adheres strictly to the GET /api/github contract from AGENTS.md Section 8

import React, { useState, useEffect } from 'react';
import PanelShell from './PanelShell';

// Known language accent colors for repo tags
const LANGUAGE_COLORS = {
  JavaScript: '#f7df1e',
  TypeScript: '#3178c6',
  Python: '#3572A5',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Rust: '#dea584',
  Go: '#00ADD8',
  C: '#555555',
  'C++': '#f34b7d',
  Java: '#b07219',
};

// Heatmap cell color based on contribution count
function getCellColor(count) {
  if (count === 0) return 'bg-slate-800/80 border-slate-750/50';
  if (count <= 2) return 'bg-emerald-900 border-emerald-800 text-emerald-200';
  if (count <= 5) return 'bg-emerald-700 border-emerald-600 text-emerald-100';
  if (count <= 9) return 'bg-emerald-500 border-emerald-400 text-white';
  return 'bg-emerald-400 border-emerald-300 text-slate-950';
}

export default function GithubPanel({
  isOpen = true,
  onClose,
  data = {},
  title,
  githubData = null, // Allows injecting mock data directly for tests and dev preview
  fetchUrl = '/api/github',
}) {
  const panel = data?.panel || data;
  const displayTitle = title || data?.title || 'Coding & Skills';
  const blurb = panel?.blurb || '';
  const skills = Array.isArray(panel?.skills) ? panel.skills : [];
  const fallbackText =
    panel?.fallbackText || 'GitHub activity is unavailable right now.';
  const fallbackUrl = panel?.profileUrl || 'https://github.com';

  const [apiData, setApiData] = useState(githubData);
  const [loading, setLoading] = useState(!githubData);
  const [error, setError] = useState(null);

  // Fetch /api/github when open unless data was passed directly
  useEffect(() => {
    if (githubData) {
      setApiData(githubData);
      setLoading(false);
      setError(null);
      return;
    }
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!isMounted) return;
        setApiData(json);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to load GitHub data');
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, githubData, fetchUrl]);

  const profile = apiData?.profile;
  const pinnedRepos = Array.isArray(apiData?.pinnedRepos) ? apiData.pinnedRepos : [];
  const contributions = apiData?.contributions;
  const hasLiveProfile = Boolean(profile?.name || profile?.avatar || profile?.url);
  const profileLink = profile?.url || fallbackUrl;

  return (
    <PanelShell
      isOpen={isOpen}
      onClose={onClose}
      title={displayTitle}
      badge="Monitor & GitHub"
    >
      <div className="flex flex-col gap-6">
        {/* Blurb Intro from content.js */}
        {blurb && (
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans bg-slate-800/40 border border-slate-750/60 rounded-xl p-4">
            {blurb}
          </p>
        )}

        {/* Core Skills Matrix (from content.js) */}
        {skills.length > 0 && (
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3 flex items-center gap-2">
              <span>Technical Skills</span>
              <span className="h-px flex-1 bg-slate-800" />
            </h3>
            <div className="flex flex-wrap gap-2.5">
              {skills.map((skill) => (
                <div
                  key={skill.name}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/70 border border-slate-700/60 shadow-sm"
                >
                  <span className="text-xs sm:text-sm font-medium text-slate-200">
                    {skill.name}
                  </span>
                  {typeof skill.level === 'number' && (
                    <div
                      className="flex items-center gap-1"
                      aria-label={`Skill level ${skill.level} of 5`}
                    >
                      {[1, 2, 3, 4, 5].map((dot) => (
                        <span
                          key={dot}
                          className={`w-1.5 h-1.5 rounded-full ${
                            dot <= skill.level ? 'bg-amber-400' : 'bg-slate-700'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* GitHub Live Integration Section */}
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3 flex items-center gap-2">
            <span>GitHub Activity</span>
            <span className="h-px flex-1 bg-slate-800" />
          </h3>

          {/* Loading Skeleton */}
          {loading && (
            <div className="flex flex-col gap-4 animate-pulse">
              {/* Profile Skeleton */}
              <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-800/40 border border-slate-750/60">
                <div className="w-12 h-12 rounded-full bg-slate-700/60 shrink-0" />
                <div className="flex flex-col gap-2 flex-1">
                  <div className="h-4 w-32 bg-slate-700/60 rounded" />
                  <div className="h-3 w-20 bg-slate-700/40 rounded" />
                </div>
              </div>
              {/* Heatmap Skeleton */}
              <div className="h-28 rounded-xl bg-slate-800/40 border border-slate-750/60" />
              {/* Repos Skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="h-24 rounded-xl bg-slate-800/40 border border-slate-750/60" />
                <div className="h-24 rounded-xl bg-slate-800/40 border border-slate-750/60" />
              </div>
            </div>
          )}

          {/* Error / Offline Fallback Card */}
          {!loading && (error || (!hasLiveProfile && pinnedRepos.length === 0)) && (
            <div className="flex flex-col items-center justify-center p-6 text-center rounded-xl bg-slate-800/30 border border-dashed border-slate-750/80">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-2.5">
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-slate-200 mb-1">
                {fallbackText}
              </p>
              <p className="text-xs text-slate-400 mb-4 max-w-sm">
                Live GitHub sync is unavailable or token is pending. You can still explore the profile directly on GitHub.
              </p>
              <a
                href={profileLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/30 transition-colors focus-visible:ring-2 focus-visible:ring-amber-400 focus:outline-none"
              >
                <span>Open GitHub Profile</span>
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          )}

          {/* Live Data Loaded Successfully */}
          {!loading && !error && hasLiveProfile && (
            <div className="flex flex-col gap-4">
              {/* Profile Card */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-slate-700/60 gap-3">
                <div className="flex items-center gap-3.5">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name || 'GitHub avatar'}
                      className="w-12 h-12 rounded-full border border-slate-600/60 object-cover bg-slate-900 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-slate-700/80 flex items-center justify-center text-slate-300 font-bold shrink-0">
                      {profile.name?.[0] || 'G'}
                    </div>
                  )}
                  <div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
                      {profile.name || 'GitHub Developer'}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span>{profile.followers ?? 0} followers</span>
                      {contributions?.total > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-emerald-400 font-mono">
                            {contributions.total} commits this year
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {profile.url && (
                  <a
                    href={profile.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-750 text-slate-200 border border-slate-700 transition-colors inline-flex items-center gap-1.5 focus-visible:ring-2 focus-visible:ring-amber-400 focus:outline-none"
                  >
                    <span>View Profile</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                )}
              </div>

              {/* Contribution Heatmap Grid */}
              {contributions?.weeks && contributions.weeks.length > 0 && (
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 flex flex-col gap-2.5">
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span className="font-semibold text-slate-300">Contribution Calendar</span>
                    <span>{contributions.total} contributions</span>
                  </div>

                  {/* Horizontal Scrollable Heatmap Weeks */}
                  <div className="overflow-x-auto pb-1 overscroll-contain">
                    <div className="flex gap-[3px] min-w-max">
                      {contributions.weeks.map((week, wIdx) => (
                        <div key={wIdx} className="flex flex-col gap-[3px]">
                          {week.days.map((day, dIdx) => (
                            <div
                              key={day.date || dIdx}
                              title={`${day.count} contributions on ${day.date}`}
                              className={`w-2.5 h-2.5 rounded-[2px] border ${getCellColor(
                                day.count
                              )} transition-transform hover:scale-125`}
                            />
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Heatmap Legend */}
                  <div className="flex items-center justify-end gap-1.5 text-[10px] font-mono text-slate-500 pt-1">
                    <span>Less</span>
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-slate-800/80 border border-slate-750/50" />
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-900 border border-emerald-800" />
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-700 border border-emerald-600" />
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-500 border border-emerald-400" />
                    <span className="w-2.5 h-2.5 rounded-[2px] bg-emerald-400 border border-emerald-300" />
                    <span>More</span>
                  </div>
                </div>
              )}

              {/* Pinned Repositories Grid */}
              {pinnedRepos.length > 0 && (
                <div>
                  <h4 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2.5">
                    Pinned Repositories
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {pinnedRepos.map((repo) => (
                      <a
                        key={repo.name}
                        href={repo.url || '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col justify-between p-3.5 rounded-xl bg-slate-800/50 hover:bg-slate-800/90 border border-slate-700/60 hover:border-amber-500/40 transition-all duration-150 shadow-sm focus-visible:ring-2 focus-visible:ring-amber-400 focus:outline-none"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-1">
                            <span className="font-semibold text-sm text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                              {repo.name}
                            </span>
                            <span
                              className="text-slate-500 group-hover:text-slate-300 text-xs shrink-0"
                              aria-hidden="true"
                            >
                              ↗
                            </span>
                          </div>
                          {repo.description && (
                            <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-3">
                              {repo.description}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-750/50">
                          {repo.language ? (
                            <div className="flex items-center gap-1.5">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{
                                  backgroundColor:
                                    LANGUAGE_COLORS[repo.language] || '#38bdf8',
                                }}
                              />
                              <span className="text-[11px] font-mono text-slate-300">
                                {repo.language}
                              </span>
                            </div>
                          ) : (
                            <span />
                          )}

                          {typeof repo.stars === 'number' && (
                            <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1">
                              ★ {repo.stars}
                            </span>
                          )}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </PanelShell>
  );
}
