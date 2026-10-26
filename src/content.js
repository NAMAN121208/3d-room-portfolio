// Greybox framing at a 30-degree vertical FOV. Each interval spans one viewport.
export const scrollSectionVh = 100;
export const scrollHint = 'Scroll to explore the room, one object at a time.';
export const stops = [
  {
    id: "intro", meshName: null, title: "Hi, I'm <name>",
    cameraPosition: [17, 13, 17], lookAt: [0, 2, -0.5], panel: null,
  },
  {
    id: "monitor", meshName: "Monitor", title: "Coding & Skills",
    cameraPosition: [0.3, 3, 1.8], lookAt: [0, 2.2, -3.2], integration: "github",
    panel: {
      blurb: "Add a short introduction to <name>'s coding journey.",
      skills: [{ name: "React", level: 4 }, { name: "Three.js", level: 2 }],
      profileUrl: "", fallbackText: "GitHub activity is unavailable right now.",
    },
  },
  {
    id: "laptop", meshName: "Laptop", title: "Games Played",
    cameraPosition: [2.5, 3, -0.2], lookAt: [1.4, 1.75, -2.65],
    panel: { blurb: "Add favourite games and memorable moments.", games: [] },
  },
  {
    id: "headphones", meshName: "Headphones", title: "Music",
    cameraPosition: [-1.10, 2.35, -0.30], lookAt: [-2.60, 1.48, -1.90], integration: "spotify",
    panel: {
      blurb: "Add a few words about <name>'s music taste.",
      // Paste a chosen playlist's https://open.spotify.com/embed/playlist/... URL.
      embedUrl: "", fallbackText: "Live listening data is unavailable right now.",
    },
  },
  {
    id: "sketchbook", meshName: "Sketchbook", title: "Art Gallery",
    cameraPosition: [2.20, 2.35, 2.90], lookAt: [0.60, 0.58, 1.30],
    panel: { blurb: "Add sketches, artwork, and the stories behind them.", artworks: [] },
  },
  {
    id: "football", meshName: "Football", title: "Football",
    cameraPosition: [3.70, 1.90, -0.60], lookAt: [2.02, 0.32, -2.28],
    panel: { blurb: "Add favourite teams, playing position, and football memories.", highlights: [] },
  },
  {
    id: "jersey", meshName: "Jersey", title: "My Football Story",
    cameraPosition: [3, 4, 0.2], lookAt: [2.6, 3.8, -4.75],
    panel: { blurb: "Add the story behind this jersey.", story: "Add <name>'s football story here." },
  },
  {
    id: "bookshelf", meshName: "Bookshelf", title: "Reading",
    cameraPosition: [6, 4.5, 3], lookAt: [-4.3, 2.1, -1],
    panel: { blurb: "Add favourite books and what they taught you.", books: [] },
  },
];
