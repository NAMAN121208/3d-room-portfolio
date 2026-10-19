// src/panels/FootballPanel.jsx
// Displays football journey, playing position, team passion, and match highlights
// Data is driven entirely by props from src/content.js (football & jersey stops)

import React from 'react';
import PanelShell from './PanelShell';

export default function FootballPanel({
  isOpen = true,
  onClose,
  data = {},
  title,
}) {
  const panel = data?.panel || data;
  const displayTitle = title || data?.title || 'Football & Match Stories';
  const blurb = panel?.blurb || '';
  const story = panel?.story || '';
  const position = panel?.position || '';
  const favoriteClubs = Array.isArray(panel?.clubs)
    ? panel.clubs
    : panel?.favoriteClub
    ? [panel.favoriteClub]
    : [];
  const highlights = Array.isArray(panel?.highlights) ? panel.highlights : [];

  return (
    <PanelShell
      isOpen={isOpen}
      onClose={onClose}
      title={displayTitle}
      badge="On the Pitch"
    >
      <div className="flex flex-col gap-6">
        {/* Blurb Intro */}
        {blurb && (
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans bg-slate-800/40 border border-slate-750/60 rounded-xl p-4">
            {blurb}
          </p>
        )}

        {/* Player Profile Quick Info (Position & Supported Clubs) */}
        {(position || favoriteClubs.length > 0) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {position && (
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center gap-3">
                <span className="text-2xl p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                  ⚽
                </span>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
                    Playing Position
                  </span>
                  <span className="text-sm font-semibold text-slate-100">
                    {position}
                  </span>
                </div>
              </div>
            )}

            {favoriteClubs.length > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center gap-3">
                <span className="text-2xl p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                  🏆
                </span>
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase tracking-wider">
                    Club Allegiance
                  </span>
                  <span className="text-sm font-semibold text-slate-100">
                    {favoriteClubs.join(', ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* The Jersey / Football Story Narrative */}
        {story && (
          <div className="relative p-5 rounded-xl bg-gradient-to-br from-slate-800/70 to-slate-850/90 border border-red-500/25 shadow-lg shadow-black/20">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-mono font-bold text-red-400 uppercase tracking-widest">
                The Kit & Legacy Story
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic whitespace-pre-line">
              "{story}"
            </p>
          </div>
        )}

        {/* Match Highlights & Memories */}
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold mb-3 flex items-center gap-2">
            <span>Match Memories & Highlights</span>
            <span className="h-px flex-1 bg-slate-800" />
          </h3>

          {highlights.length > 0 ? (
            <div className="flex flex-col gap-3">
              {highlights.map((item, idx) => (
                <div
                  key={item.title || idx}
                  className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/60 hover:border-emerald-500/40 transition-colors shadow-md"
                >
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h4 className="font-semibold text-sm text-slate-100">
                      {item.title}
                    </h4>
                    {item.year && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {item.year}
                      </span>
                    )}
                  </div>
                  {item.detail && (
                    <p className="text-xs text-slate-300/90 leading-relaxed mt-1">
                      {item.detail}
                    </p>
                  )}
                  {item.stat && (
                    <div className="mt-2 text-[11px] font-mono text-emerald-400 font-medium">
                      {item.stat}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center rounded-xl bg-slate-800/30 border border-dashed border-slate-700/60">
              <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                👟
              </div>
              <p className="text-sm font-medium text-slate-300">No match highlights listed yet</p>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                Add match memories, trophies, or stats in <code className="text-amber-400">src/content.js</code>.
              </p>
            </div>
          )}
        </div>
      </div>
    </PanelShell>
  );
}
