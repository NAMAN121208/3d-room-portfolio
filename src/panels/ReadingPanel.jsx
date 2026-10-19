// src/panels/ReadingPanel.jsx
// Displays books, reading notes, takeaways, and intellectual influences
// Data is driven entirely by props from src/content.js (bookshelf stop)

import React from 'react';
import PanelShell from './PanelShell';

export default function ReadingPanel({
  isOpen = true,
  onClose,
  data = {},
  title,
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
    >
      <div className="flex flex-col gap-6">
        {/* Blurb Intro */}
        {blurb && (
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed font-sans bg-slate-800/40 border border-slate-750/60 rounded-xl p-4">
            {blurb}
          </p>
        )}

        {/* Books List */}
        {books.length > 0 ? (
          <div className="flex flex-col gap-3.5">
            {books.map((book, idx) => (
              <div
                key={book.title || idx}
                className="group relative p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800/80 border border-slate-700/60 hover:border-amber-500/40 transition-all duration-200 shadow-md shadow-black/20 flex flex-col sm:flex-row gap-4 justify-between"
              >
                {/* Book Spine Icon & Details */}
                <div className="flex gap-3.5 items-start">
                  <div
                    className="w-10 h-14 shrink-0 rounded bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 border border-amber-500/40 flex flex-col items-center justify-between p-1 shadow-inner text-[9px] font-mono text-amber-200/80 text-center select-none"
                    style={
                      book.color ? { background: book.color } : undefined
                    }
                  >
                    <span className="text-[10px]">📖</span>
                    <span className="truncate w-full uppercase">
                      {book.category?.slice(0, 3) || 'VOL'}
                    </span>
                  </div>

                  <div className="flex flex-col justify-center">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h4 className="font-semibold text-sm sm:text-base text-slate-100 group-hover:text-amber-300 transition-colors">
                        {book.title}
                      </h4>
                      {book.category && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                          {book.category}
                        </span>
                      )}
                    </div>

                    {book.author && (
                      <p className="text-xs text-slate-400 mb-2">
                        by <span className="text-slate-300 font-medium">{book.author}</span>
                      </p>
                    )}

                    {(book.takeaway || book.notes || book.quote) && (
                      <blockquote className="text-xs text-slate-300/90 leading-relaxed italic bg-slate-900/50 rounded-lg p-2.5 border-l-2 border-amber-500/50">
                        "{book.takeaway || book.notes || book.quote}"
                      </blockquote>
                    )}
                  </div>
                </div>

                {/* Status / Rating Badge */}
                {(book.status || book.rating) && (
                  <div className="shrink-0 flex sm:flex-col justify-between sm:justify-start items-end gap-1 text-[11px] text-slate-400 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-750/50">
                    {book.rating && (
                      <span className="font-mono text-amber-400 font-semibold">
                        {book.rating}
                      </span>
                    )}
                    {book.status && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-700/50 text-slate-300">
                        {book.status}
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
              📚
            </div>
            <p className="text-sm font-medium text-slate-300">No books recorded yet</p>
            <p className="text-xs text-slate-500 mt-1 max-w-xs">
              Add your favorite reads, takeaways, and authors in <code className="text-amber-400">src/content.js</code>.
            </p>
          </div>
        )}
      </div>
    </PanelShell>
  );
}
