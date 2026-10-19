// Camera coordinates are starting points: tune them after the room model exists.
export const stops = [
  {
    id: "intro", meshName: null, title: "Hi, I'm <name>",
    cameraPosition: [10, 8, 10], lookAt: [0, 1, 0], panel: null,
  },
  {
    id: "monitor", meshName: "Monitor", title: "Coding & Skills",
    cameraPosition: [2, 2.5, 3], lookAt: [0, 2, 0], integration: "github",
    panel: {
      blurb: "Add a short introduction to <name>'s coding journey.",
      skills: [{ name: "React", level: 4 }, { name: "Three.js", level: 2 }],
      profileUrl: "", fallbackText: "GitHub activity is unavailable right now.",
    },
  },
  {
    id: "laptop", meshName: "Laptop", title: "Games Played",
    cameraPosition: [3, 2.5, 3], lookAt: [1, 1.5, 0],
    panel: { blurb: "Add favourite games and memorable moments.", games: [] },
  },
  {
    id: "sketchbook", meshName: "Sketchbook", title: "Art Gallery",
    cameraPosition: [3, 3, 2], lookAt: [1, 1, -1],
    panel: { blurb: "Add sketches, artwork, and the stories behind them.", artworks: [] },
  },
  {
    id: "headphones", meshName: "Headphones", title: "Music",
    cameraPosition: [1, 2.5, 2], lookAt: [-1, 1.5, 0], integration: "spotify",
    panel: {
      blurb: "Add a few words about <name>'s music taste.",
      // Paste a chosen playlist's https://open.spotify.com/embed/playlist/... URL.
      embedUrl: "", fallbackText: "Live listening data is unavailable right now.",
    },
  },
  {
    id: "football", meshName: "Football", title: "Football",
    cameraPosition: [-2, 1.5, 3], lookAt: [-2, 0.3, 0],
    panel: { blurb: "Add favourite teams, playing position, and football memories.", highlights: [] },
  },
  {
    id: "jersey", meshName: "Jersey", title: "My Football Story",
    cameraPosition: [-3, 3, 2], lookAt: [-3, 2, -1],
    panel: { blurb: "Add the story behind this jersey.", story: "Add <name>'s football story here." },
  },
  {
    id: "bookshelf", meshName: "Bookshelf", title: "Reading",
    cameraPosition: [-2, 3, -1], lookAt: [-2, 1.5, -3],
    panel: { blurb: "Add favourite books and what they taught you.", books: [] },
  },
];
