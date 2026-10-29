// src/panels/SpotifyPanel.jsx
// Compact floating detail card for Headphones stop (Music & Spotify)
// Displays current listening state, top tracks, or playlist embed

import React, { useState, useEffect } from 'react';
import PanelShell from './PanelShell';

export default function SpotifyPanel({
  isOpen = true,
  onClose,
  data = {},
  title,
  anchor = null,
  spotifyData = null,
  fetchUrl = '/api/spotify',
}) {
  const panel = data?.panel || data;
  const displayTitle = title || data?.title || 'Music & Spotify';
  const blurb =
    panel?.blurb ||
    'Soundtracks for coding, late-night deep work sessions, and match days.';
  const embedUrl = panel?.embedUrl || '';
  const fallbackText =
    panel?.fallbackText || 'Live Spotify listening data is unavailable right now.';

  const [apiData, setApiData] = useState(spotifyData);
  const [loading, setLoading] = useState(!spotifyData && !embedUrl);

  useEffect(() => {
    if (spotifyData) {
      setApiData(spotifyData);
      setLoading(false);
      return;
    }
    if (embedUrl || !isOpen) return;

    let isMounted = true;
    fetch(fetchUrl)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((json) => {
        if (!isMounted) return;
        setApiData(json);
        setLoading(false);
      })
      .catch(() => {
        if (!isMounted) return;
        setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, embedUrl, spotifyData, fetchUrl]);

  return (
    <PanelShell
      isOpen={isOpen}
      onClose={onClose}
      title={displayTitle}
      badge="Spotify"
      anchor={anchor}
    >
      <div className="flex flex-col gap-3">
        {/* Blurb */}
        {blurb && (
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed bg-slate-800/40 border border-slate-750/50 rounded-lg p-2.5">
            {blurb}
          </p>
        )}

        {/* 1. Spotify Iframe Embed if URL provided */}
        {embedUrl ? (
          <div className="rounded-xl overflow-hidden border border-slate-700/60 shadow-inner">
            <iframe
              src={embedUrl}
              width="100%"
              height="152"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Spotify Player"
            />
          </div>
        ) : apiData?.isPlaying && apiData.nowPlaying ? (
          /* 2. Live Now Playing State */
          <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex items-center gap-3">
            {apiData.nowPlaying.albumArt ? (
              <img
                src={apiData.nowPlaying.albumArt}
                alt="Album art"
                className="w-12 h-12 rounded-lg object-cover border border-emerald-500/40 shrink-0"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-emerald-900/60 flex items-center justify-center text-xl shrink-0">
                🎵
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">
                ● Now Playing
              </span>
              <h4 className="text-xs sm:text-sm font-semibold text-slate-100 truncate">
                {apiData.nowPlaying.title}
              </h4>
              <p className="text-[11px] text-slate-400 truncate">
                {apiData.nowPlaying.artist}
              </p>
            </div>
          </div>
        ) : (
          /* 3. Fallback / Curated Music Taste Cards */
          <div className="flex flex-col gap-2">
            <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center text-lg shrink-0">
                🎧
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-semibold text-slate-200">
                  Focus & Creative Beats
                </h4>
                <p className="text-[11px] text-slate-400 truncate">
                  Lo-fi, Ambient Electronic, Synthwave
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-400 italic px-1">
              {fallbackText}
            </p>

            <a
              href="https://open.spotify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 transition-colors"
            >
              <span>Listen on Spotify</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        )}
      </div>
    </PanelShell>
  );
}
