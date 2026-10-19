# AGENTS.md: 3D Room Portfolio

Read this file fully before making any change. It is the shared source of truth for every AI coding tool working in this repo (Codex, Antigravity).

---

## 1. Project goal

A personal portfolio website shaped like a **3D isometric room**. As the visitor scrolls, the camera glides from object to object. Each object represents a part of the owner's life. Clicking an object zooms in and opens a detail panel.

**Secondary goal: learning.** The owner is using this project to learn frontend animation, scroll effects, and 3D on the web through "vibe coding". So:
- Prefer clear, readable code over clever code.
- Add short comments explaining *why* for non-obvious 3D, camera, and animation logic.
- When finishing a task, give a 3 to 5 line plain-English explanation of what was built and which values the owner can tweak to experiment.

---

## 2. Tech stack (do not swap without asking)

| Concern | Choice |
|---|---|
| Build | Vite + React |
| Styling | Tailwind CSS |
| 3D | Three.js via `@react-three/fiber` (R3F) + `@react-three/drei` |
| Scroll animation | GSAP + ScrollTrigger |
| Smooth scroll | Lenis |
| UI / panel animation | Framer Motion |
| Backend | Serverless functions in `/api` (Vercel format) |
| Hosting | Vercel |
| Model compression | `gltf-transform` |

---

## 3. Scope: 7 interactive objects

| Scroll stop | Object | Section | Integration |
|---|---|---|---|
| 1 | Whole room (wide shot) | Intro and name | none |
| 2 | Monitor | Coding and skills | **GitHub** |
| 3 | Laptop | Games played | none |
| 4 | Sketchbook (on desk) | Art gallery | none |
| 5 | Headphones (on stand) | Music | **Spotify** |
| 6 | Football and boots | Football | none |
| 7 | Jersey (on wall) | Football story | none |
| 8 | Bookshelf | Reading | none |

Stop 1 is the intro wide shot. Stops 2 to 8 are the seven objects. Order is chosen to keep camera moves short: desk items first, then football items, then the shelf.

**Out of scope for now:** extra objects (plant, lamp, cat, camera, console), sound design, day/night toggle. Do not add them unless asked.

---

## 4. Content lives in one file

All text, links, and per-object config live in `src/content.js`. Components read from it. **Never hardcode portfolio text inside 3D or panel components.**

```js
// src/content.js
export const stops = [
  {
    id: "intro",
    meshName: null,                     // wide shot, no clickable mesh
    title: "Hi, I'm <name>",
    cameraPosition: [10, 8, 10],        // x, y, z
    lookAt: [0, 1, 0],
    panel: null,
  },
  {
    id: "monitor",
    meshName: "Monitor",                // MUST match the mesh name in the .glb exactly
    title: "Coding & Skills",
    cameraPosition: [2, 2.5, 3],
    lookAt: [0, 2, 0],
    integration: "github",              // "github" | "spotify" | undefined
    panel: {
      blurb: "Short intro about my skills.",
      skills: [{ name: "React", level: 4 }, { name: "Three.js", level: 2 }],
    },
  },
  // laptop, sketchbook, headphones, football, jersey, bookshelf follow the same shape
];
```

Placeholder values above are starting points. The owner will tune camera numbers by eye.

**Rule:** mesh names in the 3D model must match `meshName`. Click handling, hover highlights, and camera targets all key off this. If a mesh is not found, log a clear console warning rather than failing silently.

---

## 5. Suggested folder structure

```
/api
  spotify.js          # serverless: Spotify data, secrets stay here
  github.js           # serverless: GitHub contribution + repo data
/public/models
  room.glb            # compressed room model
/src
  content.js          # all portfolio content (see section 4)
  /scene
    Room.jsx          # loads the model, wires hover/click per mesh
    CameraRig.jsx     # scroll progress -> camera position/lookAt
    Lights.jsx
  /panels
    PanelShell.jsx    # shared animated container
    GithubPanel.jsx
    SpotifyPanel.jsx
    GamesPanel.jsx
    SketchGallery.jsx
    FootballPanel.jsx
    ReadingPanel.jsx
  /hooks
    useScrollProgress.js
    useActiveStop.js
  /ui
    Loader.jsx
    Cursor.jsx
  App.jsx
  main.jsx
AGENTS.md
```

---

## 6. Architecture rules

1. **Scroll drives the camera.** A single scroll progress value (0 to 1) is mapped to the stops in `content.js`. `CameraRig` interpolates position and lookAt between adjacent stops with easing. Use Lenis for smoothing and GSAP ScrollTrigger to bind scroll to progress.
2. **Click-to-zoom is a state machine**, not scattered booleans:
   - `idle` (scroll controls the camera)
   - `focused(objectId)` (camera locked to that object, panel open, scroll disabled)
   - Closing the panel (button or Esc) returns to `idle` and restores the previous scroll position with no jump.
3. **Hover feedback on every clickable mesh** (outline or glow plus pointer cursor), so visitors know what is interactive.
4. **Panels are HTML overlays**, not 3D text. The monitor's contents may use drei `<Html>` anchored to the screen mesh as a starting point.
5. **Every external call needs a loading state and an error fallback.** The site must still look good if GitHub or Spotify is down.
6. **Performance budget:** model under ~5 MB after compression, lazy load the scene, target 60fps on a mid-range laptop. Dispose of unused textures and geometries.
7. **Mobile:** simpler fallback. Keep the 3D with reduced pixel ratio and no heavy effects, or show a 2D stacked layout if the frame rate is poor. Do not ship a layout that breaks on a phone.
8. **Accessibility basics:** all panel content must be reachable by keyboard, have visible focus states, and respect `prefers-reduced-motion` (skip camera tweening and use fades instead).

---

## 7. Integration: Spotify (fancy option)

Goal: the headphones panel shows what the owner is listening to, top tracks, and top artists, with album art. Headphones pulse subtly when something is currently playing.

**Security rules (non-negotiable):**
- Client ID, client secret, and refresh token live **only** in environment variables on the server. Never in frontend code, never committed, never logged.
- Provide `.env.example` with variable names and no values:
  ```
  SPOTIFY_CLIENT_ID=
  SPOTIFY_CLIENT_SECRET=
  SPOTIFY_REFRESH_TOKEN=
  GITHUB_TOKEN=
  GITHUB_USERNAME=
  ```
- Visitors never log in. The function authenticates as the owner using a long-lived refresh token.

**Flow:**
1. One-time setup script (`scripts/get-spotify-token.js`, run locally by the owner) does the OAuth authorization-code flow and prints the refresh token. Needed scopes: `user-read-currently-playing`, `user-top-read`, `user-read-recently-played`.
2. `/api/spotify` exchanges the refresh token for an access token, then fetches data and returns clean JSON.
3. Frontend only calls `/api/spotify`.

**API contract: `GET /api/spotify`**
```json
{
  "isPlaying": true,
  "nowPlaying": { "title": "", "artist": "", "albumArt": "", "url": "" },
  "topTracks": [{ "title": "", "artist": "", "albumArt": "", "url": "" }],
  "topArtists": [{ "name": "", "image": "", "url": "" }],
  "fetchedAt": "ISO timestamp"
}
```
- Cache responses server-side for 30 to 60 seconds (`Cache-Control: s-maxage`), so visitors do not hammer Spotify.
- If a field is unavailable, return it empty, not a 500.

**Caveat:** Spotify has restricted some endpoints and preview URLs for newer apps, and rules change. **Check the current Spotify Web API docs before choosing endpoints.** If an endpoint is blocked, fall back to the **Spotify embed iframe** for a chosen playlist (no auth needed) and tell the owner.

---

## 8. Integration: GitHub

Goal: the monitor panel shows pinned or top repos, languages, and a contribution heatmap.

- `/api/github` uses the GitHub **GraphQL API** with `GITHUB_TOKEN` (read-only, public data scopes only). It is needed for the contribution calendar and pinned repos.
- Token stays server-side only.

**API contract: `GET /api/github`**
```json
{
  "profile": { "name": "", "avatar": "", "followers": 0, "url": "" },
  "pinnedRepos": [{ "name": "", "description": "", "stars": 0, "language": "", "url": "" }],
  "contributions": {
    "total": 0,
    "weeks": [{ "days": [{ "date": "YYYY-MM-DD", "count": 0 }] }]
  },
  "fetchedAt": "ISO timestamp"
}
```
- Cache for 10 to 30 minutes.
- Frontend renders the heatmap itself (simple grid of divs or canvas), color intensity by count.
- If the call fails, show a friendly fallback with a link to the GitHub profile.

---

## 9. Work split between tools

Both tools write code in the same repo. **To avoid conflicts, each owns different files.** Never edit the other tool's files without telling the owner.

### Antigravity owns: visuals and look-and-feel
- Project scaffolding and Tailwind setup
- Lenis smooth scroll setup
- `src/panels/*` (layout, styling, animation)
- `src/ui/*` (loader, cursor)
- Lighting, colors, materials, hover glow, mood
- Section text reveals and polish animations
- Responsive and mobile layout checks (use the browser to verify visually)

### Codex owns: logic, data, and hardening
- `src/scene/CameraRig.jsx` and scroll-to-camera mapping
- Click-to-zoom state machine and Esc/back handling
- `src/content.js` schema and validation (warn when a `meshName` is missing from the model)
- `/api/spotify`, `/api/github`, the Spotify token script, and caching
- Performance work (gltf-transform compression, lazy loading, disposal)
- Bug fixing (scroll/click conflicts, camera jumps at stop boundaries)
- Final code review of the other tool's work

### Shared rules
- One git branch per task (`feat/camera-rig`, `feat/github-panel`). The owner merges.
- Commit small and often with clear messages, so any step can be rolled back.
- Do not do large refactors or rename files unprompted.
- If a task needs a file owned by the other tool, stop and describe the needed change instead.

---

## 10. Build phases

| Phase | Task | Owner |
|---|---|---|
| 1 | Scaffold Vite + React + Tailwind + R3F, add Lenis | Antigravity |
| 2 | Greybox room built from simple named boxes (Monitor, Laptop, Sketchbook, Headphones, Football, Jersey, Bookshelf) so work is not blocked on art | Antigravity |
| 3 | `content.js` schema and `CameraRig` driven by scroll, 8 stops | Codex |
| 4 | Hover highlight and click-to-zoom state machine, empty `PanelShell` | Codex (logic), Antigravity (shell styling) |
| 5 | Panels: Games, Sketch gallery, Football, Reading (static content) | Antigravity |
| 6 | `/api/github` + `GithubPanel` | Codex (API), Antigravity (panel) |
| 7 | `/api/spotify` + token script + `SpotifyPanel` | Codex (API), Antigravity (panel) |
| 8 | Swap in the real room model, rename meshes to match `content.js`, set up lighting | Antigravity |
| 9 | Loader, cursor, text reveals, polish | Antigravity |
| 10 | Optimization, mobile fallback, accessibility pass, final review | Codex |

Finish and verify each phase before starting the next.

---

## 11. Model requirements (for the real room)

- Format: `.glb`, compressed with `gltf-transform` (Draco or Meshopt, textures resized or converted to WebP/KTX2).
- Each of the 7 objects must be a **separate, named mesh or group** matching `meshName` exactly.
- Greybox first. The real model only replaces it once camera and click logic already work.

---

## 12. Definition of done (per task)

- Runs with no console errors or warnings
- Works at desktop and phone widths
- Loading and error states handled for anything async
- No secrets in frontend code or committed files
- Content comes from `content.js`, with nothing hardcoded
- Short explanation added for the owner (what changed, what to tweak)

---

## 13. Things to ask the owner before doing

- Adding any new library not listed in section 2
- Adding any object or feature outside section 3
- Changing the scroll order or the state machine design
- Anything involving credentials, tokens, or paid services
