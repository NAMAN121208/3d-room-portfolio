// Each named group has its own focus view. Tune these with ?debug=1.
export const objects = [
  {
    id: "monitor", meshName: "Monitor", title: "Coding & Skills",
    focus: { cameraPosition: [1.5, 2.4, 0], lookAt: [0.277, 1.537, -2.388] }, integration: "github",
    panel: {
      blurb: "Add a short introduction to <name>'s coding journey.",
      skills: [{ name: "React", level: 4 }, { name: "Three.js", level: 2 }],
      profileUrl: "", fallbackText: "GitHub activity is unavailable right now.",
    },
  },
  {
    id: "laptop", meshName: "Laptop", title: "Games Played", integration: null,
    focus: { cameraPosition: [0.5, 2.4, 0.1], lookAt: [-0.75, 1.513, -2.218] },
    panel: { blurb: "Add favourite games and memorable moments.", games: [] },
  },
  {
    id: "headphones", meshName: "Headphones", title: "Music",
    focus: { cameraPosition: [-1.10, 2.35, -0.30], lookAt: [-2.60, 1.48, -1.90] }, integration: "spotify",
    panel: {
      blurb: "Add a few words about <name>'s music taste.",
      // Paste a chosen playlist's https://open.spotify.com/embed/playlist/... URL.
      embedUrl: "", fallbackText: "Live listening data is unavailable right now.",
    },
  },
  {
    id: "sketchbook", meshName: "Sketchbook", title: "Art Gallery", integration: null,
    focus: { cameraPosition: [2.20, 2.35, 2.90], lookAt: [0.60, 0.58, 1.30] },
    panel: { blurb: "Add sketches, artwork, and the stories behind them.", artworks: [] },
  },
  {
    id: "football", meshName: "Football", title: "Football", integration: null,
    focus: { cameraPosition: [3.70, 1.90, -0.60], lookAt: [2.02, 0.32, -2.28] },
    panel: { blurb: "Add favourite teams, playing position, and football memories.", highlights: [], story: "Add <name>'s football story here." },
  },
  {
    id: "bookshelf", meshName: "Bookshelf", title: "Reading", integration: null,
    focus: { cameraPosition: [1.7, 3.6, 4], lookAt: [-2.482, 1.639, 0.114] },
    panel: { blurb: "Add favourite books and what they taught you.", books: [] },
  },
];
