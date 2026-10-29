// src/panels/ReadingPanel.jsx
// Compact floating detail card for Bookshelf stop (Reading)
// Displays books, takeaways, and intellectual influences

import React from 'react';
import PanelShell from './PanelShell';

export default function ReadingPanel({
  isOpen = true,
  onClose,
  data = {},
  title,
  anchor = null,
}) {
  const panel = data?.panel || data;
  const displayTitle = title || data?.title || 'Reading Shelf';
  const blurb = panel?.blurb || '';
  const books = Array.isArray(panel?.books) ? panel.books : [];

  return (
    <PanelShell
      isOpen={isOpen}
      onClose={onClose}
      title={displayTitle}
      badge="Bookshelf"
      anchor={anchor}
    >
      <div className="flex flex-col gap-3">
        {/* Compact blurb */}
        {blurb && (
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-800/40 border border-slate-750/50 rounded-lg p-2.5">
            {blurb}
          </p>
        )}

        {/* Compact Book List */}
        {books.length > 0 ? (
          <div className="flex flex-col gap-2">
            {books.map((book, idx) => (
              <div
                key={book.title || idx}
                className="group p-2.5 rounded-lg bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/60 hover:border-amber-500/40 transition-colors shadow-sm flex flex-col gap-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h4 className="font-semibold text-xs sm:text-sm text-slate-100 group-hover:text-amber-300 transition-colors truncate">
                      {book.title}
                    </h4>
                    {book.author && (
                      <p className="text-[11px] text-slate-400">
                        by <span className="text-slate-300">{book.author}</span>
                      </p>
                    )}
                  </div>
                  {book.rating && (
                    <span className="font-mono text-xs text-amber-400 font-semibold shrink-0">
                      {book.rating}
                    </span>
                  )}
                </div>

                {(book.takeaway || book.notes || book.quote) && (
                  <blockquote className="text-[11px] text-slate-300/90 leading-snug italic bg-slate-900/50 rounded p-2 border-l-2 border-amber-500/50">
                    "{book.takeaway || book.notes || book.quote}"
                  </blockquote>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400 bg-slate-800/30 rounded-lg border border-dashed border-slate-700/60">
            📖 No books added to shelf yet.
          </div>
        )}
      </div>
    </PanelShell>
  );
}
