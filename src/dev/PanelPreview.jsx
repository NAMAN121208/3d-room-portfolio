// src/dev/PanelPreview.jsx
// Dev-only preview harness to test and inspect the portfolio panels without the 3D scene.
// Allows testing opening, closing, Esc-to-close, focus trap, and mock data vs error fallback.

import React, { useState } from 'react';
import GithubPanel from '../panels/GithubPanel';
import GamesPanel from '../panels/GamesPanel';
import SketchGallery from '../panels/SketchGallery';
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
      profileUrl: 'https://github.com/NAMAN121208',
      fallbackText: 'GitHub activity is unavailable right now.',
    },
  },
  laptop: {
    id: 'laptop',
    title: 'Games Played',
    panel: {
      blurb:
        'Gaming has been my creative sanctuary and design masterclass. From immersive open-world physics to atmospheric soundtracks, here are some titles that shaped how I think about digital worlds.',
      games: [
        {
          title: 'The Legend of Zelda: Tears of the Kingdom',
          platform: 'Nintendo Switch',
          genre: 'Action-Adventure',
          hours: '140 hrs',
          rating: '10 / 10',
          status: 'completed',
          favorite: true,
          note: 'The emergent physics sandbox and spatial puzzle mechanics are unmatched in modern game design.',
        },
        {
          title: 'Elden Ring',
          platform: 'PC',
          genre: 'Action RPG',
          hours: '210 hrs',
          rating: '10 / 10',
          status: 'completed',
          favorite: true,
          note: 'Masterclass in environmental storytelling and breathtaking landscape composition.',
        },
        {
          title: 'Hades',
          platform: 'PC / Switch',
          genre: 'Roguelike',
          hours: '85 hrs',
          rating: '9.5 / 10',
          status: 'completed',
          favorite: false,
          note: 'Incredible fluid animation, punchy game feel, and seamless narrative integration.',
        },
        {
          title: 'Cyberpunk 2077: Phantom Liberty',
          platform: 'PC',
          genre: 'Narrative RPG',
          hours: '95 hrs',
          rating: '9 / 10',
          status: 'completed',
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
          title: 'University Regional Cup Semifinals',
          year: '2025',
          stat: '2 Assists • Player of the Match',
          detail:
            'Down 0-2 at halftime; delivered two through-balls in the second half to inspire a 3-2 comeback victory.',
        },
        {
          title: 'Weekend 7-a-Side Championship',
          year: '2024',
          stat: 'Tournament Champions',
          detail:
            'Undefeated 6-match run through the knockout bracket, maintaining high pressing and fast counterattacks.',
        },
        {
          title: 'First Full 90 Under Saturday Floodlights',
          year: '2023',
          stat: 'Starting 11 Debut',
          detail:
            'The match that cemented my love for controlling midfield tempo and tactical transition play.',
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
          category: 'Systems Architecture',
          rating: '10 / 10',
          status: 'Essential Read',
          color: 'linear-gradient(135deg, #1e3a8a, #172554)',
          takeaway:
            'Reliability, scalability, and maintainability are not abstract ideals—they are trade-offs between consensus algorithms, storage engines, and network partitions.',
        },
        {
          title: 'The Design of Everyday Things',
          author: 'Don Norman',
          category: 'User Experience',
          rating: '9.5 / 10',
          status: 'Completed',
          color: 'linear-gradient(135deg, #b45309, #78350f)',
          takeaway:
            'Good design is actually a lot harder to notice than poor design, in part because good designs fit our needs so well that the design is invisible.',
        },
        {
          title: 'The Three-Body Problem',
          author: 'Cixin Liu',
          category: 'Hard Sci-Fi',
          rating: '10 / 10',
          status: 'Favorite Fiction',
          color: 'linear-gradient(135deg, #047857, #064e3b)',
          takeaway:
            'A profound cosmic perspective on physics, civilizations, and existential vulnerability in an indifferent universe.',
        },
        {
          title: 'Atomic Habits',
          author: 'James Clear',
          category: 'Behavioral Psychology',
          rating: '9 / 10',
          status: 'Annual Re-read',
          color: 'linear-gradient(135deg, #6d28d9, #4c1d95)',
          takeaway:
            'You do not rise to the level of your goals. You fall to the level of your systems.',
        },
      ],
    },
  },
};

export default function PanelPreview() {
  const [activePanel, setActivePanel] = useState(null);
  const [useEmptyData, setUseEmptyData] = useState(false);

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
    {
      id: 'monitor',
      name: 'GithubPanel',
      icon: '💻',
      stop: 'Monitor',
      color: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30',
    },
    {
      id: 'laptop',
      name: 'GamesPanel',
      icon: '🎮',
      stop: 'Laptop',
      color: 'from-blue-500/20 to-indigo-500/10 border-blue-500/30',
    },
    {
      id: 'sketchbook',
      name: 'SketchGallery',
      icon: '🎨',
      stop: 'Sketchbook',
      color: 'from-amber-500/20 to-orange-500/10 border-amber-500/30',
    },
    {
      id: 'football',
      name: 'FootballPanel',
      icon: '⚽',
      stop: 'Football & Boots',
      color: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30',
    },
    {
      id: 'bookshelf',
      name: 'ReadingPanel',
      icon: '📚',
      stop: 'Bookshelf',
      color: 'from-purple-500/20 to-fuchsia-500/10 border-purple-500/30',
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#0b0f19] text-slate-100 p-6 md:p-12 font-sans flex flex-col items-center">
      {/* Dev Header */}
      <div className="w-full max-w-4xl mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
              Dev Mode Preview
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-100">
            Portfolio Panels Preview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Click any card to inspect animations, Esc-to-close, focus traps, and mock data.
          </p>
        </div>

        {/* Toggle Empty Data / Error Mode */}
        <button
          type="button"
          onClick={() => setUseEmptyData(!useEmptyData)}
          className={`shrink-0 px-3.5 py-2 rounded-xl text-xs font-medium border transition-colors ${
            useEmptyData
              ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
              : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
          }`}
        >
          {useEmptyData ? 'Mode: Error & Empty Fallbacks' : 'Mode: Sample Data (Active)'}
        </button>
      </div>

      {/* Panels Selection Cards */}
      <div className="w-full max-w-4xl grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {panels.map((p) => (
          <div
            key={p.id}
            onClick={() => setActivePanel(p.id)}
            className={`p-6 rounded-2xl bg-gradient-to-br ${p.color} border hover:scale-[1.02] cursor-pointer transition-all duration-200 shadow-xl flex items-center justify-between group`}
          >
            <div className="flex items-center gap-4">
              <span className="text-4xl p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                {p.icon}
              </span>
              <div>
                <span className="text-[11px] font-mono text-slate-400 block">
                  Stop: {p.stop}
                </span>
                <h2 className="text-lg font-bold text-slate-100 group-hover:text-amber-300 transition-colors">
                  {p.name}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click to open animated panel
                </p>
              </div>
            </div>

            <span className="text-slate-400 group-hover:text-white text-lg font-semibold transition-transform group-hover:translate-x-1">
              →
            </span>
          </div>
        ))}
      </div>

      {/* Live Active Panels Render */}
      {activePanel === 'monitor' && (
        <GithubPanel
          isOpen={true}
          onClose={() => setActivePanel(null)}
          data={currentData.monitor}
          githubData={useEmptyData ? { profile: { name: '', avatar: '', followers: 0, url: '' }, pinnedRepos: [], contributions: { total: 0, weeks: [] } } : sampleGithubData}
        />
      )}

      {activePanel === 'laptop' && (
        <GamesPanel
          isOpen={true}
          onClose={() => setActivePanel(null)}
          data={currentData.laptop}
        />
      )}

      {activePanel === 'sketchbook' && (
        <SketchGallery
          isOpen={true}
          onClose={() => setActivePanel(null)}
          data={currentData.sketchbook}
        />
      )}

      {activePanel === 'football' && (
        <FootballPanel
          isOpen={true}
          onClose={() => setActivePanel(null)}
          data={currentData.football}
        />
      )}

      {activePanel === 'bookshelf' && (
        <ReadingPanel
          isOpen={true}
          onClose={() => setActivePanel(null)}
          data={currentData.bookshelf}
        />
      )}
    </div>
  );
}
