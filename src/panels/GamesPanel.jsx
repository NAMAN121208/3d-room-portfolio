// src/panels/GamesPanel.jsx
// Compact floating detail card for Laptop stop (Games Played)
// Data is driven entirely by props from src/content.js

import React from 'react';
import PanelShell from './PanelShell';

export default function GamesPanel({
  isOpen = true,
  onClose,
  data = {},
  title,
  anchor = null,
}) {
  const panel = data?.panel || data;
  const displayTitle = title || data?.title || 'Games Played';
  const blurb = panel?.blurb || '';
  const games = Array.isArray(panel?.games) ? panel.games : [];

  return (
    <PanelShell
      isOpen={isOpen}
      onClose={onClose}
      title={displayTitle}
      badge="Gaming Station"
      anchor={anchor}
    >
      <div className="flex flex-col gap-3">
        {/* Compact 1-2 line blurb */}
        {blurb && (
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-800/40 border border-slate-750/50 rounded-lg p-2.5">
            {blurb}
          </p>
        )}

        {/* Compact Scrollable Games List */}
        {games.length > 0 ? (
          <div className="flex flex-col gap-2">
            {games.map((game, idx) => (
              <div
                key={game.title || idx}
                className="group p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/60 hover:border-amber-500/40 transition-colors shadow-sm"
              >
                {/* Title & Platform */}
                <div className="flex items-start justify-between gap-1.5 mb-1">
                  <h3 className="font-semibold text-xs sm:text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                    {game.title}
                  </h3>
                  {game.platform && (
                    <span className="shrink-0 text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-700/60 text-slate-300 border border-slate-600/50">
                      {game.platform}
                    </span>
                  )}
                </div>

                {/* Genre & Rating */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mb-1.5">
                  {game.genre && <span>{game.genre}</span>}
                  {game.genre && game.hours && <span>•</span>}
                  {game.hours && <span>{game.hours}</span>}
                  {(game.genre || game.hours) && game.rating && <span>•</span>}
                  {game.rating && (
                    <span className="text-amber-400 font-medium font-mono">
                      {game.rating}
                    </span>
                  )}
                </div>

                {/* Note */}
                {game.note && (
                  <p className="text-[11px] text-slate-300/90 leading-snug italic bg-slate-900/40 rounded p-1.5 border border-slate-800/60">
                    "{game.note}"
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400 bg-slate-800/30 rounded-lg border border-dashed border-slate-700/60">
            🎮 No games logged yet.
          </div>
        )}
      </div>
    </PanelShell>
  );
}
