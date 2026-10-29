// src/panels/FootballPanel.jsx
// Compact floating detail card for Football stop
// Displays player stats, club allegiance, match memories, and the story behind the cleats and kit

import React from 'react';
import PanelShell from './PanelShell';

export default function FootballPanel({
  isOpen = true,
  onClose,
  data = {},
  title,
  anchor = null,
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
      anchor={anchor}
    >
      <div className="flex flex-col gap-3">
        {/* Compact blurb */}
        {blurb && (
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-800/40 border border-slate-750/50 rounded-lg p-2.5">
            {blurb}
          </p>
        )}

        {/* Player Stats: Position & Supported Clubs */}
        {(position || favoriteClubs.length > 0) && (
          <div className="grid grid-cols-2 gap-2">
            {position && (
              <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60 flex items-center gap-2">
                <span className="text-lg p-1 rounded bg-emerald-500/10 text-emerald-400">
                  ⚽
                </span>
                <div className="min-w-0">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
                    Position
                  </span>
                  <span className="text-xs font-semibold text-slate-100 truncate block">
                    {position}
                  </span>
                </div>
              </div>
            )}

            {favoriteClubs.length > 0 && (
              <div className="p-2.5 rounded-lg bg-slate-800/50 border border-slate-700/60 flex items-center gap-2">
                <span className="text-lg p-1 rounded bg-amber-500/10 text-amber-400">
                  🏆
                </span>
                <div className="min-w-0">
                  <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider block">
                    Club
                  </span>
                  <span className="text-xs font-semibold text-slate-100 truncate block">
                    {favoriteClubs.join(', ')}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* The Football / Legacy Story Field */}
        {story && (
          <div className="p-3 rounded-lg bg-gradient-to-br from-slate-800/70 to-slate-850/90 border border-amber-500/30 shadow-sm">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider">
                Football Story
              </span>
            </div>
            <p className="text-xs text-slate-200 leading-relaxed italic whitespace-pre-line">
              "{story}"
            </p>
          </div>
        )}

        {/* Match Memories & Highlights */}
        {highlights.length > 0 && (
          <div>
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold mb-2">
              Match Highlights
            </h4>
            <div className="flex flex-col gap-2">
              {highlights.map((item, idx) => (
                <div
                  key={item.match || idx}
                  className="p-2.5 rounded-lg bg-slate-800/40 border border-slate-750/50"
                >
                  <div className="flex justify-between items-baseline gap-1 mb-0.5">
                    <span className="font-semibold text-xs text-slate-200">
                      {item.match}
                    </span>
                    {item.year && (
                      <span className="text-[9px] font-mono text-slate-400">
                        {item.year}
                      </span>
                    )}
                  </div>
                  {item.memory && (
                    <p className="text-[11px] text-slate-400 leading-snug">
                      {item.memory}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </PanelShell>
  );
}
