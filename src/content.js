// src/content.js
// Single source of truth for all portfolio content.
// NEVER hardcode portfolio text inside 3D or panel components.
// Mesh names in the 3D model must match meshName exactly.

export const stops = [
  {
    id: "intro",
    meshName: null, // wide shot, no clickable mesh
    title: "Hi, I'm Naman",
    cameraPosition: [10, 8, 10], // x, y, z
    lookAt: [0, 1, 0],
    panel: null,
  },
  {
    id: "monitor",
    meshName: "Monitor", // MUST match the mesh name in the scene exactly
    title: "Coding & Skills",
    cameraPosition: [2, 2.5, 3],
    lookAt: [0, 2, 0],
    integration: "github", // "github" | "spotify" | undefined
    panel: {
      blurb: "Short intro about my skills.",
      skills: [
        { name: "React", level: 4 },
        { name: "Three.js", level: 2 },
      ],
    },
  },
  {
    id: "laptop",
    meshName: "Laptop",
    title: "Games Played",
    cameraPosition: [1.5, 2.2, 2.5],
    lookAt: [0.5, 1.8, 0],
    panel: {
      blurb: "Favorite games and platforms.",
      games: [],
    },
  },
  {
    id: "sketchbook",
    meshName: "Sketchbook",
    title: "Art Gallery",
    cameraPosition: [1, 2, 2],
    lookAt: [-0.5, 1.8, 0],
    panel: {
      blurb: "Sketches and creative drawings.",
      sketches: [],
    },
  },
  {
    id: "headphones",
    meshName: "Headphones",
    title: "Music",
    cameraPosition: [2, 2.2, 2],
    lookAt: [1.2, 2, 0],
    integration: "spotify",
    panel: {
      blurb: "What I'm listening to while building.",
    },
  },
  {
    id: "football",
    meshName: "Football",
    title: "Football",
    cameraPosition: [2.5, 1.5, 3],
    lookAt: [1.5, 0.5, 1.5],
    panel: {
      blurb: "On the pitch and beyond.",
    },
  },
  {
    id: "jersey",
    meshName: "Jersey",
    title: "Football Story",
    cameraPosition: [0, 3, 4],
    lookAt: [0, 3, -2],
    panel: {
      blurb: "The story behind the kit.",
    },
  },
  {
    id: "bookshelf",
    meshName: "Bookshelf",
    title: "Reading",
    cameraPosition: [-2, 3, 3],
    lookAt: [-2.5, 2.5, 0],
    panel: {
      blurb: "Books, ideas, and notes.",
      books: [],
    },
  },
];
