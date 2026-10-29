// src/panels/SketchGallery.jsx
// Compact floating detail card for Sketchbook stop (Art Gallery)
// Features: 2-column thumbnail grid; clicking an artwork opens a full-screen Lightbox.
// Esc closes the lightbox first, then the card.

import React, { useState, useEffect, useRef } from 'react';
import PanelShell from './PanelShell';

export default function SketchGallery({
  isOpen = true,
  onClose,
  data = {},
  title,
  anchor = null,
}) {
  const panel = data?.panel || data;
  const displayTitle = title || data?.title || 'Art Gallery';
  const blurb = panel?.blurb || '';
  const items = Array.isArray(panel?.artworks)
    ? panel.artworks
    : Array.isArray(panel?.sketches)
    ? panel.sketches
    : [];

  const [selectedArtwork, setSelectedArtwork] = useState(null);
  const lightboxRef = useRef(null);

  // Keyboard navigation for Lightbox: Esc closes lightbox first before card
  useEffect(() => {
    if (!selectedArtwork) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation(); // Prevents useClickToZoom Esc handler from closing the card
        setSelectedArtwork(null);
      }
    };

    // Use capture phase so lightbox intercepts Esc before useClickToZoom
    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, [selectedArtwork]);

  // Focus close button inside lightbox when it opens
  useEffect(() => {
    if (selectedArtwork && lightboxRef.current) {
      const closeBtn = lightboxRef.current.querySelector('button[aria-label="Close lightbox"]');
      closeBtn?.focus();
    }
  }, [selectedArtwork]);

  return (
    <>
      <PanelShell
        isOpen={isOpen}
        onClose={onClose}
        title={displayTitle}
        badge="Sketchbook"
        anchor={anchor}
      >
        <div className="flex flex-col gap-3">
          {/* 1-2 line blurb */}
          {blurb && (
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-800/40 border border-slate-750/50 rounded-lg p-2.5">
              {blurb}
            </p>
          )}

          {/* 2-Column Thumbnail Grid */}
          {items.length > 0 ? (
            <div className="grid grid-cols-2 gap-2">
              {items.map((art, idx) => (
                <button
                  key={art.title || idx}
                  type="button"
                  onClick={() => setSelectedArtwork(art)}
                  className="group text-left flex flex-col rounded-lg overflow-hidden bg-slate-800/50 hover:bg-slate-800/90 border border-slate-700/60 hover:border-amber-500/50 transition-all duration-150 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-[4/3] w-full bg-slate-950 flex items-center justify-center overflow-hidden border-b border-slate-750/60">
                    {art.image ? (
                      <img
                        src={art.image}
                        alt={art.title || 'Artwork thumbnail'}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    ) : (
                      <div className="w-full h-full p-2 flex flex-col justify-between bg-gradient-to-br from-slate-900 to-slate-950 text-slate-400">
                        <span className="text-[9px] font-mono text-slate-500">
                          #{idx + 1}
                        </span>
                        <div className="text-center">
                          <span className="text-xl block opacity-60">🎨</span>
                          <span className="text-[10px] font-serif text-slate-300 truncate block mt-0.5">
                            {art.title}
                          </span>
                        </div>
                        <span className="text-[9px] text-slate-500 font-mono text-right truncate">
                          {art.medium || 'Sketch'}
                        </span>
                      </div>
                    )}
                    {/* Hover expand indicator */}
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-900/90 text-amber-300 border border-amber-500/40">
                        Expand ⤢
                      </span>
                    </div>
                  </div>

                  {/* Thumbnail Caption */}
                  <div className="p-2 flex flex-col">
                    <h3 className="font-semibold text-xs text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                      {art.title}
                    </h3>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-0.5">
                      <span className="text-amber-400/90 truncate">{art.medium}</span>
                      {art.year && <span className="font-mono shrink-0">{art.year}</span>}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-6 text-center text-xs text-slate-400 bg-slate-800/30 rounded-lg border border-dashed border-slate-700/60">
              ✏️ No artwork added yet.
            </div>
          )}
        </div>
      </PanelShell>

      {/* FULL-SCREEN LIGHTBOX: Only layer allowed full-screen */}
      {selectedArtwork && (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="lightbox-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/90 backdrop-blur-md animate-fade-in"
          onClick={() => setSelectedArtwork(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[85vh] flex flex-col bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Lightbox Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-800 bg-slate-900/80">
              <div>
                <h3
                  id="lightbox-title"
                  className="font-bold text-base sm:text-lg text-slate-100"
                >
                  {selectedArtwork.title}
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedArtwork.medium} {selectedArtwork.year && `• ${selectedArtwork.year}`}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedArtwork(null)}
                aria-label="Close lightbox"
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Lightbox Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Artwork View */}
              {selectedArtwork.image ? (
                <div className="rounded-xl overflow-hidden border border-slate-800 bg-black flex items-center justify-center max-h-[50vh]">
                  <img
                    src={selectedArtwork.image}
                    alt={selectedArtwork.title}
                    className="max-h-[50vh] w-auto object-contain"
                  />
                </div>
              ) : (
                <div className="aspect-[16/9] w-full rounded-xl bg-gradient-to-br from-slate-850 via-slate-900 to-slate-950 border border-slate-800 flex flex-col items-center justify-center p-6 text-center">
                  <span className="text-4xl mb-2">🎨</span>
                  <span className="font-serif text-lg text-slate-200">
                    {selectedArtwork.title}
                  </span>
                  <span className="text-xs font-mono text-amber-400 mt-1">
                    {selectedArtwork.medium}
                  </span>
                </div>
              )}

              {/* Story Description */}
              {(selectedArtwork.story || selectedArtwork.description) && (
                <div className="p-3.5 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <h4 className="text-[11px] font-mono uppercase tracking-wider text-amber-400 font-semibold mb-1">
                    Behind the Artwork
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                    {selectedArtwork.story || selectedArtwork.description}
                  </p>
                </div>
              )}

              {/* Tags */}
              {selectedArtwork.tags && selectedArtwork.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {selectedArtwork.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700/50"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Lightbox Footer */}
            <div className="px-5 py-2.5 bg-slate-950/40 border-t border-slate-800 flex justify-between items-center text-[11px] text-slate-400">
              <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-slate-300">Esc</kbd> to exit preview</span>
              <button
                type="button"
                onClick={() => setSelectedArtwork(null)}
                className="text-xs text-amber-400 hover:text-amber-300 font-medium"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
