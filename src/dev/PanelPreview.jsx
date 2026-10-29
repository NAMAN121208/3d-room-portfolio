// src/dev/PanelPreview.jsx
// Dev-only preview harness to test and inspect the portfolio floating cards without the 3D scene.
// Allows testing floating card layout, responsive anchoring, fake 3D anchor points,
// SVG leader line, pulsing dot, closing, and compact panel states.

import React, { useState } from 'react';
import GithubPanel from '../panels/GithubPanel';
import GamesPanel from '../panels/GamesPanel';
import SketchGallery from '../panels/SketchGallery';
import SpotifyPanel from '../panels/SpotifyPanel';
import FootballPanel from '../panels/FootballPanel';
import ReadingPanel from '../panels/ReadingPanel';

// Generate 40 weeks of realistic contribution counts for the heatmap preview
function generateSampleWeeks() {
  const weeks = [];
  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() - 40 * 7);

  const samplePattern = [0, 1, 0, 4, 2, 7, 3, 0, 0, 5, 2, 1, 8, 4, 0, 2, 6, 3, 1, 0];

  for (let w = 0; w < 40; w++) {
    const days = [];
    for (let d = 0; d < 7; d++) {
      const curDate = new Date(baseDate);
      curDate.setDate(curDate.getDate() + (w * 7 + d));
      const patternIdx = (w * 7 + d) % samplePattern.length;
      const count = samplePattern[patternIdx];
      days.push({
        date: curDate.toISOString().slice(0, 10),
        count,
      });
    }
    weeks.push({ days });
  }
  return weeks;
}

// Full mock data according to the GET /api/github JSON contract in AGENTS.md Section 8
export const sampleGithubData = {
  profile: {
    name: 'Naman Raghav',
    avatar: 'https://avatars.githubusercontent.com/u/291439189?v=4',
    followers: 18,
    url: 'https://github.com/NAMAN121208',
  },
  pinnedRepos: [
    {
      name: '3d-room-portfolio',
      description:
        'Interactive 3D isometric room portfolio website built with Vite, React Three Fiber, GSAP, and Tailwind CSS.',
      stars: 12,
      language: 'JavaScript',
      url: 'https://github.com/NAMAN121208/3d-room-portfolio',
    },
    {
      name: 'Project-Atlas',
      description:
        'Distributed telemetry processing and anomaly detection engine with real-time stream analytics.',
      stars: 8,
      language: 'TypeScript',
      url: 'https://github.com/NAMAN121208/Project-Atlas',
    },
    {
      name: 'gridpulse',
      description:
        'High-performance energy grid load balancer and predictive monitoring platform with fast solver loops.',
      stars: 15,
      language: 'Python',
      url: 'https://github.com/NAMAN121208/gridpulse',
    },
    {
      name: 'dayflow-hrms',
      description:
        'Modern employee management and shift tracking web application with role-based access control.',
      stars: 5,
      language: 'TypeScript',
      url: 'https://github.com/NAMAN121208/dayflow-hrms',
    },
  ],
  contributions: {
    total: 384,
    weeks: generateSampleWeeks(),
  },
  fetchedAt: new Date().toISOString(),
};

// Rich sample data following the exact schema required for each stop
export const samplePanelData = {
  monitor: {
    id: 'monitor',
    title: 'Coding & Skills',
    panel: {
      blurb:
        'Full-stack developer building interactive 3D web experiences, robust backend APIs, and real-time systems. Always exploring the intersection of creative animation and performant architecture.',
      skills: [
        { name: 'React', level: 5 },
        { name: 'Three.js / R3F', level: 4 },
        { name: 'TypeScript', level: 4 },
        { name: 'Tailwind CSS', level: 5 },
        { name: 'Node.js', level: 4 },
        { name: 'GraphQL', level: 3 },
      ],
      fallbackText: 'GitHub activity is unavailable right now.',
      profileUrl: 'https://github.com/NAMAN121208',
    },
  },
  laptop: {
    id: 'laptop',
    title: 'Games Played',
    panel: {
      blurb:
        'Games that shaped my eye for systemic game mechanics, environmental storytelling, and stylized real-time 3D graphics.',
      games: [
        {
          title: 'Elden Ring',
          platform: 'PC / Steam',
          genre: 'Action RPG',
          hours: '140+ hrs',
          rating: '10 / 10',
          status: 'Completed',
          favorite: true,
          note: 'Unmatched environmental direction and layered vertical level architecture.',
        },
        {
          title: 'Hollow Knight',
          platform: 'PC / Switch',
          genre: 'Metroidvania',
          hours: '85 hrs',
          rating: '10 / 10',
          status: '112% Complete',
          favorite: true,
          note: 'Masterclass in atmospheric audio design and precise responsive movement.',
        },
        {
          title: 'Cyberpunk 2077',
          platform: 'PC',
          genre: 'Open-World RPG',
          hours: '110 hrs',
          rating: '9.5 / 10',
          status: 'Completed',
          favorite: false,
          note: 'World-class atmospheric lighting, architectural verticality, and character writing.',
        },
      ],
    },
  },
  sketchbook: {
    id: 'sketchbook',
    title: 'Art Gallery',
    panel: {
      blurb:
        'Before code, there is pencil and paper. These drawings are visual explorations in isometric perspective, architecture, and creature design from my personal sketchbooks.',
      artworks: [
        {
          title: 'Isometric Room Study #04',
          medium: 'Ink & Digital Paint',
          year: '2026',
          tags: ['Isometric', 'Architecture', 'Interior'],
          story:
            'Exploring warm indoor lighting and geometric furniture layout that eventually inspired the concept for this very 3D portfolio room.',
        },
        {
          title: 'Rainy Alleyway Composition',
          medium: 'Graphite on 160gsm Moleskine',
          year: '2025',
          tags: ['Cityscape', 'Perspective', 'Shadows'],
          story:
            'Drawn during an autumn rainstorm in the city. Focused on reflective puddles, neon signs, and dramatic tonal contrast.',
        },
        {
          title: 'Cybernetic Street Vendor',
          medium: 'Procreate & Charcoal',
          year: '2025',
          tags: ['Character Design', 'Sci-Fi'],
          story:
            'A character concept for a bustling futuristic night market. Explored mechanical prosthetics blended with traditional street market wear.',
        },
        {
          title: 'Botanical Herbarium Study',
          medium: 'Fine-liner & Sepia Wash',
          year: '2024',
          tags: ['Botanical', 'Fine Line', 'Nature'],
          story:
            'Detailed anatomical study of potted succulents and ferns that sit on my studio windowsill.',
        },
      ],
    },
  },
  headphones: {
    id: 'headphones',
    title: 'Music & Spotify',
    panel: {
      blurb:
        'Soundtracks for coding, late-night deep work sessions, and match days.',
      fallbackText: 'Live listening data is unavailable right now.',
    },
  },
  football: {
    id: 'football',
    title: 'Football & The Beautiful Game',
    panel: {
      blurb:
        'Football is more than 90 minutes on grass; it is strategy, instinct, and camaraderie. Whether playing under floodlights or watching derbies on weekends, the sport runs deep.',
      position: 'Central Midfielder (#8 / Deep-Lying Playmaker)',
      favoriteClub: 'Arsenal FC / Real Madrid',
      story:
        'My favorite red-and-white jersey was gifted to me after our university squad came back from two goals down in the regional cup semifinals. The number 8 printed on the back reminds me that controlling the tempo and staying composed under pressure wins matches—both on the pitch and in programming.',
      highlights: [
        {
          match: 'University Regional Cup Semifinals',
          year: '2025',
          memory:
            'Down 0-2 at halftime; delivered two through-balls in the second half to inspire a 3-2 comeback victory.',
        },
        {
          match: 'Weekend 7-a-Side Championship',
          year: '2024',
          memory:
            'Undefeated 6-match run through the knockout bracket, maintaining high pressing and fast counterattacks.',
        },
      ],
    },
  },
  bookshelf: {
    id: 'bookshelf',
    title: 'Reading Shelf',
    panel: {
      blurb:
        'Books are compressed mental models from the minds of thinkers who spent decades mastering their craft. Here are the volumes that have permanently reshaped how I think and build.',
      books: [
        {
          title: 'Designing Data-Intensive Applications',
          author: 'Martin Kleppmann',
          category: 'Systems',
          rating: '10 / 10',
          takeaway:
            'Reliability, scalability, and maintainability are not abstract ideals—they are trade-offs between consensus algorithms, storage engines, and network partitions.',
        },
        {
          title: 'The Design of Everyday Things',
          author: 'Don Norman',
          category: 'Design',
          rating: '9.5 / 10',
          takeaway:
            'Good design is actually a lot harder to notice than poor design, in part because good designs fit our needs so well that the design is invisible.',
        },
        {
          title: 'Atomic Habits',
          author: 'James Clear',
          category: 'Psychology',
          rating: '9 / 10',
          takeaway:
            'You do not rise to the level of your goals. You fall to the level of your systems.',
        },
      ],
    },
  },
};

export default function PanelPreview() {
  const [activePanel, setActivePanel] = useState('laptop');
  const [useEmptyData, setUseEmptyData] = useState(false);

  // Fake anchor position for testing floating card anchoring without 3D scene
  const [anchorPreset, setAnchorPreset] = useState('center');
  const [customAnchor, setCustomAnchor] = useState({ x: 500, y: 350 });

  const anchorPresets = {
    left: { x: 260, y: 360, label: 'Left Object (forces card Right)' },
    center: { x: 540, y: 380, label: 'Center Object (balances placement)' },
    right: { x: 920, y: 340, label: 'Right Object (forces card Left)' },
  };

  const activeAnchorCoord =
    anchorPreset === 'custom' ? customAnchor : anchorPresets[anchorPreset];

  const fakeAnchor = {
    x: activeAnchorCoord.x,
    y: activeAnchorCoord.y,
    rect: {
      left: activeAnchorCoord.x - 35,
      right: activeAnchorCoord.x + 35,
      top: activeAnchorCoord.y - 30,
      bottom: activeAnchorCoord.y + 30,
    },
    isCameraZoomed: true,
  };

  // Fallback empty data to test empty states and API errors
  const emptyPanelData = {
    monitor: {
      title: 'Coding & Skills',
      panel: {
        blurb: 'Full-stack developer building interactive web software.',
        skills: [{ name: 'React', level: 4 }, { name: 'Three.js', level: 2 }],
        fallbackText: 'GitHub activity is unavailable right now.',
        profileUrl: 'https://github.com/NAMAN121208',
      },
    },
    laptop: {
      title: 'Games Played',
      panel: { blurb: 'Games library is currently empty.', games: [] },
    },
    sketchbook: {
      title: 'Art Gallery',
      panel: { blurb: 'No sketches published yet.', artworks: [] },
    },
    headphones: {
      title: 'Music & Spotify',
      panel: { blurb: 'Music tracks loading...', fallbackText: 'Spotify offline' },
    },
    football: {
      title: 'Football',
      panel: { blurb: 'Football stats coming soon.', highlights: [], story: '' },
    },
    bookshelf: {
      title: 'Reading Shelf',
      panel: { blurb: 'Reading list is being organized.', books: [] },
    },
  };

  const currentData = useEmptyData ? emptyPanelData : samplePanelData;

  const panels = [
    { id: 'monitor', name: 'Monitor (Github)', icon: '💻' },
    { id: 'laptop', name: 'Laptop (Games)', icon: '🎮' },
    { id: 'sketchbook', name: 'Sketchbook (Art)', icon: '🎨' },
    { id: 'headphones', name: 'Headphones (Music)', icon: '🎧' },
    { id: 'football', name: 'Football (Cleats)', icon: '⚽' },
    { id: 'bookshelf', name: 'Bookshelf (Reading)', icon: '📚' },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#0a0d14] text-slate-100 font-sans overflow-hidden">
      {/* Dev Control Bar */}
      <div className="relative z-10 p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <h1 className="text-sm font-bold tracking-wide text-slate-100">
            Floating Card & Anchor Preview
          </h1>
        </div>

        {/* Anchor Position Presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-slate-400">Anchor:</span>
          {Object.entries(anchorPresets).map(([key, p]) => (
            <button
              key={key}
              type="button"
              onClick={() => setAnchorPreset(key)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors border ${
                anchorPreset === key
                  ? 'bg-amber-500/20 border-amber-400 text-amber-300 font-bold'
                  : 'bg-slate-800 border-slate-750 text-slate-400 hover:text-slate-200'
              }`}
            >
              {key.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Empty data toggle */}
        <button
          type="button"
          onClick={() => setUseEmptyData(!useEmptyData)}
          className={`px-3 py-1 rounded-lg text-xs font-medium border transition-colors ${
            useEmptyData
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          {useEmptyData ? 'Data: Empty State' : 'Data: Rich Mock'}
        </button>
      </div>

      {/* Panel Selection Tabs */}
      <div className="relative z-10 px-4 py-2 bg-slate-950/60 border-b border-slate-800/80 flex flex-wrap gap-2">
        {panels.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setActivePanel(p.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border ${
              activePanel === p.id
                ? 'bg-slate-800 border-amber-500/60 text-amber-300 shadow-md'
                : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>{p.icon}</span>
            <span>{p.name}</span>
          </button>
        ))}

        {activePanel && (
          <button
            type="button"
            onClick={() => setActivePanel(null)}
            className="ml-auto px-3 py-1 rounded-lg text-xs font-mono bg-red-950/40 border border-red-500/30 text-red-300 hover:bg-red-900/40 transition-colors"
          >
            ✕ Close Card
          </button>
        )}
      </div>

      {/* Simulated 3D Viewport with Fake 3D Object Anchor */}
      <div className="relative w-full h-[calc(100vh-105px)] overflow-hidden bg-gradient-to-b from-[#0a0d14] via-[#0d121f] to-[#0a0d14]">
        {/* Subtle grid pattern background */}
        <div
          className="absolute inset-0 opacity-15 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(#334155 1px, transparent 1px), linear-gradient(90deg, #334155 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        {/* Fake 3D Object Box */}
        <div
          className="absolute z-20 flex flex-col items-center justify-center pointer-events-none transition-all duration-300"
          style={{
            left: `${fakeAnchor.x}px`,
            top: `${fakeAnchor.y}px`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-20 h-16 rounded-xl bg-slate-800/90 border-2 border-dashed border-amber-400/80 shadow-2xl flex flex-col items-center justify-center p-2 text-center">
            <span className="text-xl">📦</span>
            <span className="text-[10px] font-mono text-amber-300 font-bold truncate">
              {activePanel || 'Object'}
            </span>
          </div>
          <span className="text-[9px] font-mono text-slate-400 mt-1 bg-slate-900/80 px-1.5 py-0.5 rounded border border-slate-800">
            x:{fakeAnchor.x}, y:{fakeAnchor.y}
          </span>
        </div>

        {/* Active Floating Panel Rendered with Fake Anchor */}
        {activePanel === 'monitor' && (
          <GithubPanel
            isOpen={true}
            onClose={() => setActivePanel(null)}
            data={currentData.monitor}
            anchor={fakeAnchor}
            githubData={
              useEmptyData
                ? {
                    profile: { name: '', avatar: '', followers: 0, url: '' },
                    pinnedRepos: [],
                    contributions: { total: 0, weeks: [] },
                  }
                : sampleGithubData
            }
          />
        )}

        {activePanel === 'laptop' && (
          <GamesPanel
            isOpen={true}
            onClose={() => setActivePanel(null)}
            data={currentData.laptop}
            anchor={fakeAnchor}
          />
        )}

        {activePanel === 'sketchbook' && (
          <SketchGallery
            isOpen={true}
            onClose={() => setActivePanel(null)}
            data={currentData.sketchbook}
            anchor={fakeAnchor}
          />
        )}

        {activePanel === 'headphones' && (
          <SpotifyPanel
            isOpen={true}
            onClose={() => setActivePanel(null)}
            data={currentData.headphones}
            anchor={fakeAnchor}
          />
        )}

        {activePanel === 'football' && (
          <FootballPanel
            isOpen={true}
            onClose={() => setActivePanel(null)}
            data={currentData.football}
            anchor={fakeAnchor}
          />
        )}

        {activePanel === 'bookshelf' && (
          <ReadingPanel
            isOpen={true}
            onClose={() => setActivePanel(null)}
            data={currentData.bookshelf}
            anchor={fakeAnchor}
          />
        )}
      </div>
    </div>
  );
}
