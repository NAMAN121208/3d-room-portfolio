# Content and integration setup

Use Node.js 22 or newer. No additional dependencies are needed for these files.

## Content

Edit `src/content.js` to replace `<name>`, fill in the panel text and lists, and tune
`focus.cameraPosition` / `focus.lookAt` once the room exists. The six model object names must
match `meshName` exactly. Call `validateContent(objects)` during development and
`validateSceneMeshes(objects, gltf.scene)` after loading the model. Both helpers
return lists of problems and log clear warnings; they do not render UI.

## Exploration and focus

Camera defaults, angle/zoom limits, framing fractions, and tween durations are at
the top of `src/scene/CameraRig.jsx`. `INTERACTION_MODE` selects `drag` or `follow`.
Open `?debug=1` to copy the current camera position and target into an object's
`focus` entry. Desktop framing targets 87.5% of viewport height; narrow screens
fit the room's width so it remains visible.

Inside `FocusProvider`, `useFocus()` exposes `status`, `objectId`, `focus(id)`,
and `close()`. Only show panels when status is `focused`; the camera signals
`arrived(id)` and `returned()` after movement. Closing also works during a glide.
Additional object clicks outside `exploring` are ignored. The headphones use the
existing empty PanelShell until the Spotify panel is implemented.

## Environment and GitHub

Copy `.env.example` to `.env` and fill in its five variables locally. `.env` is
already ignored by Git. Add the same values to the server-side environment in
Vercel when deploying. Never prefix secrets with `VITE_` or import API modules into
frontend code.

Set `GITHUB_USERNAME` to your login and `GITHUB_TOKEN` to a token limited to reading
public data (prefer a fine-grained, public-repository-only token with read-only
permissions). No private repository access or write permissions are needed by
this integration. `/api/github` reads pinned public repositories, profile data,
and the contribution calendar through GraphQL. Its shared cache lasts 15 minutes.
Set the monitor panel's `profileUrl` to your public profile as an additional UI
fallback; the API also supplies that URL when a configured username is available.

## Spotify

1. Create an app in the Spotify developer dashboard. Development Mode requires
   the owner to have an active Premium subscription; authorize the owner's account.
2. Register exactly `http://127.0.0.1:8888/callback` as a redirect URI.
3. Set `SPOTIFY_CLIENT_ID` and `SPOTIFY_CLIENT_SECRET` in your local `.env`.
4. Run `node --env-file=.env scripts/get-spotify-token.js` from the repository root.
   Open the printed authorization link in your browser and approve access.
5. Copy the printed refresh token into `SPOTIFY_REFRESH_TOKEN` locally and in
   Vercel. The script prints it only to your terminal, never to the callback page,
   and closes after completion or after five minutes. Visitors do not log in.

The script requests `user-read-currently-playing`, `user-top-read`, and
`user-read-recently-played` as specified in AGENTS.md. The current API response
does not use recently played data. `/api/spotify` refreshes the owner's access
token and reads `/me/player/currently-playing`, `/me/top/tracks`, and
`/me/top/artists`. The shared cache lasts 60 seconds. No audio preview endpoints
are used. Failed requests yield empty fields; successful sibling requests survive.

Documentation checked on 2026-10-19:

- [Development Mode changes](https://developer.spotify.com/documentation/web-api/tutorials/february-2026-migration-guide):
  Premium is required, new apps have a five-user limit, and some unrelated
  endpoints (including `/artists/{id}/top-tracks`) are removed.
- [User's top items](https://developer.spotify.com/documentation/web-api/reference/get-users-top-artists-and-tracks)
  and [currently playing](https://developer.spotify.com/documentation/web-api/reference/get-the-users-currently-playing-track)
  remain documented. Availability for your app still needs a credentialed check.
- [Authorization code flow](https://developer.spotify.com/documentation/web-api/tutorials/code-flow)
  and [redirect URIs](https://developer.spotify.com/documentation/web-api/concepts/redirect_uri).

If access is blocked or you cannot use Development Mode, the proposed fallback
is a [Spotify playlist embed](https://developer.spotify.com/documentation/embeds/tutorials/creating-an-embed),
which needs no API credentials. Choose your playlist, copy its embed URL into the
headphones panel's `embedUrl`, and have the UI display the iframe when live data
is unavailable. This change supplies the configuration only; it does not build
the panel or change the API contract to add a fallback flag.

## Verification

Run `node --test tests/content-and-api.test.mjs`. Tests use mocked upstream data
and a local OAuth callback server with dummy credentials. Live account access
and deployment routing require your configured credentials and the future app
scaffold. Vite alone does not serve Vercel's `/api` functions.
