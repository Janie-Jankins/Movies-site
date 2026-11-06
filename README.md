# Lumina

A cinematic movie browser with a featured carousel, a large TMDB catalogue, search, genre browsing, a watchlist, and a sample video player.

## TMDB API key

Movie data comes from [The Movie Database](https://www.themoviedb.org/). The key stays on the Vite server and is not bundled into the site.

1. Create a free TMDB account.
2. Open [API settings](https://www.themoviedb.org/settings/api) and create a developer API key.
3. Copy `.env.example` to `.env`.
4. Set `TMDB_API_KEY` to that key.
5. Restart the dev server.

```bash
npm install
npm run dev
```

Open the local URL Vite prints. `npm run preview` also proxies TMDB, after `npm run build`.

This product uses the TMDB API but is not endorsed or certified by TMDB. Catalogue counts are whatever TMDB returns for a filter. They are not every film ever released.

Playback uses the Blender Foundation's Creative Commons-licensed Sintel trailer, served by W3C. It is a short demo clip, not a feature-length film. Trailers, when TMDB has one, play from YouTube's official embed.

The sample player streams through `/api/media/:id`. The backend only proxies the listed demo clip and forwards HTTP byte ranges so seeking works; it does not accept arbitrary video URLs. Vite serves the same endpoint locally, and `api/media/[id].js` exposes it as a Node.js function on Vercel. The selected catalogue movie is not the sample clip, and full-length films require a licensed streaming provider or media you own.
