// src/panels/GamesPanel.jsx
// Displays favorite games, platforms, and memorable moments
// Data is driven entirely by props from src/content.js (laptop stop)

import React from 'react';
import PanelShell from './PanelShell';

export default function GamesPanel({
  isOpen = true,
  onClose,
  data = {},
  title,
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
    >
      <div className="flex flex-col gap-6">
        {/* Blurb Intro */}
        {blurb && (
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans bg-slate-800/40 border border-slate-750/60 rounded-xl p-4">
            {blurb}
          </p>
        )}

        {/* Games List or Empty Fallback */}
        {games.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {games.map((game, idx) => (
              <div
                key={game.title || idx}
                className="group relative flex flex-col justify-between p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/60 hover:border-amber-500/40 transition-all duration-200 shadow-lg shadow-black/20"
              >
                <div>
                  {/* Top Bar: Title & Platform Badge */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <h3 className="font-semibold text-sm sm:text-base text-slate-100 group-hover:text-amber-300 transition-colors">
                      {game.title}
                    </h3>
                    {game.platform && (
                      <span className="shrink-0 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-700/60 text-slate-300 border border-slate-600/50">
                        {game.platform}
                      </span>
                    )}
                  </div>

                  {/* Genre / Hours / Rating Info */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-2.5">
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

                  {/* Personal Memory / Note */}
                  {game.note && (
                    <p className="text-xs text-slate-300/90 leading-relaxed italic bg-slate-900/40 rounded-lg p-2.5 border border-slate-800/60">
                      "{game.note}"
                    </p>
                  )}
                </div>

                {/* Status / Highlight Tag */}
                {game.status && (
                  <div className="mt-3 pt-2 border-t border-slate-750/50 flex items-center justify-between text-[11px] text-slate-400">
                    <span className="capitalize">{game.status}</span>
                    {game.favorite && (
                      <span className="text-amber-400 flex items-center gap-1 font-medium">
                        ★ Favorite
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl bg-slate-800/30 border border-dashed border-slate-700/60">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
              🎮
            </div>
            <p className="text-sm font-medium text-slate-300">No games logged yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Add your favorite titles, platforms, and memories to <code className="text-amber-400">src/content.js</code>.
            </p>
          </div>
        )}
      </div>
    </PanelShell>
  );
}
