// src/panels/SketchGallery.jsx
// Displays artwork, creative sketches, mediums, and the stories behind them
// Data is driven entirely by props from src/content.js (sketchbook stop)

import React, { useState } from 'react';
import PanelShell from './PanelShell';

export default function SketchGallery({
  isOpen = true,
  onClose,
  data = {},
  title,
}) {
  const panel = data?.panel || data;
  const displayTitle = title || data?.title || 'Art Gallery';
  const blurb = panel?.blurb || '';
  const items = Array.isArray(panel?.artworks)
    ? panel.artworks
    : Array.isArray(panel?.sketches)
    ? panel.sketches
    : [];

  const [activeItem, setActiveItem] = useState(null);

  return (
    <PanelShell
      isOpen={isOpen}
      onClose={onClose}
      title={displayTitle}
      badge="Sketchbook"
    >
      <div className="flex flex-col gap-6">
        {/* Blurb Intro */}
        {blurb && (
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans bg-slate-800/40 border border-slate-750/60 rounded-xl p-4">
            {blurb}
          </p>
        )}

        {/* Artworks Gallery */}
        {items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map((art, idx) => (
              <div
                key={art.title || idx}
                onClick={() => setActiveItem(art)}
                className="group cursor-pointer flex flex-col rounded-xl overflow-hidden bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/60 hover:border-amber-500/40 transition-all duration-200 shadow-lg shadow-black/20 focus-within:ring-2 focus-within:ring-amber-400"
              >
                {/* Visual Artwork Thumbnail / Canvas Placeholder */}
                <div className="relative aspect-[4/3] w-full bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-750/60">
                  {art.image ? (
                    <img
                      src={art.image}
                      alt={art.title || 'Artwork thumbnail'}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    /* Stylized Art Canvas Placeholder */
                    <div className="w-full h-full p-4 flex flex-col justify-between bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-slate-400">
                      <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                        <span>PAGE #{idx + 1}</span>
                        {art.medium && <span>{art.medium}</span>}
                      </div>
                      <div className="text-center my-auto">
                        <span className="text-3xl block mb-1 opacity-60">🎨</span>
                        <span className="text-xs font-serif text-slate-300 tracking-wide block">
                          {art.title}
                        </span>
                      </div>
                      <div className="text-right text-[10px] text-slate-500 font-mono">
                        {art.date || art.year || 'Original Sketch'}
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay Hint */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-900/90 text-amber-300 border border-amber-500/30">
                      View Story ↗
                    </span>
                  </div>
                </div>

                {/* Card Details */}
                <div className="p-3.5 flex flex-col justify-between flex-1">
                  <div>
                    <div className="flex items-baseline justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm text-slate-100 group-hover:text-amber-300 transition-colors">
                        {art.title}
                      </h3>
                      {(art.date || art.year) && (
                        <span className="text-[10px] font-mono text-slate-400 shrink-0">
                          {art.date || art.year}
                        </span>
                      )}
                    </div>

                    {art.medium && (
                      <p className="text-xs text-amber-400/90 font-medium mb-2">
                        {art.medium}
                      </p>
                    )}

                    {(art.story || art.description) && (
                      <p className="text-xs text-slate-300/85 line-clamp-2 leading-relaxed">
                        {art.story || art.description}
                      </p>
                    )}
                  </div>

                  {art.tags && art.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3 pt-2 border-t border-slate-750/50">
                      {art.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900/60 text-slate-400"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-xl bg-slate-800/30 border border-dashed border-slate-700/60">
            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
              ✏️
            </div>
            <p className="text-sm font-medium text-slate-300">No artwork added yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Add your drawings, mediums, and artistic stories to <code className="text-amber-400">src/content.js</code>.
            </p>
          </div>
        )}

        {/* Selected Artwork Detail Modal/Drawer if clicked */}
        {activeItem && (
          <div className="p-4 rounded-xl bg-slate-800/90 border border-amber-500/30 shadow-xl">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="font-bold text-base text-amber-300">
                  {activeItem.title}
                </h4>
                <p className="text-xs text-slate-400">
                  {activeItem.medium} {activeItem.year && `• ${activeItem.year}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="text-xs px-2 py-1 rounded bg-slate-700 text-slate-300 hover:text-white"
              >
                Close Story
              </button>
            </div>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed mt-2 whitespace-pre-line">
              {activeItem.story || activeItem.description || 'No detailed story attached.'}
            </p>
          </div>
        )}
      </div>
    </PanelShell>
  );
}
