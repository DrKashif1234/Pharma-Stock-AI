# PharmaStock AI

A pharmacy inventory management web app with an integrated AI assistant
(Google Gemini). No login, no accounts, no access restrictions — every
feature is available the moment the app loads. Data is stored in the
browser's local storage.

## Stack

- React + TypeScript + Vite + Tailwind CSS
- `react-router-dom` for navigation
- `html5-qrcode` for the camera QR/barcode scanner
- Two Vercel serverless functions (`/api/chat`, `/api/report`) that call
  the Gemini API — this keeps your API key on the server, never in the
  browser bundle.

## Run locally

```bash
npm install
npm run dev
```

The AI Assistant and AI Reports pages call `/api/chat` and `/api/report`.
Those only exist as Vercel serverless functions, so to test them locally
use the Vercel CLI instead of plain `vite`:

```bash
npm install -g vercel
vercel dev
```

`vercel dev` serves both the Vite frontend and the `/api` functions on one
port, using a `.env` file you create from `.env.example`.

## Deploy to Vercel

1. Push this project to a Git repo (GitHub/GitLab/Bitbucket) and import it
   in Vercel, **or** run `vercel` from this folder.
2. In your Vercel Project → **Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` — your key from Google AI Studio. Do **not** prefix
     it with `VITE_` — that would bundle it into client-side JS and expose
     it publicly.
   - `GEMINI_MODEL` (optional) — defaults to `gemini-1.5-flash`. If that
     model isn't available in your account/region, `/api/_gemini.ts`
     automatically falls back through a list of current Gemini Flash
     models, so a retired model name won't break the app.
3. Redeploy after adding the environment variables (Vercel only injects
   them into new deployments).

### Common Vercel + AI-assistant pitfalls this project already avoids

- **Key exposed in the frontend** — the Gemini key is only read inside
  `api/_gemini.ts`, which runs server-side. It's never referenced from any
  file under `src/`.
- **Function timeout** — `vercel.json` requests a 30s timeout for both AI
  routes (Pro plans get this automatically; Hobby plans are capped lower,
  so very large inventories may need a smaller `maxOutputTokens` or a plan
  upgrade).
- **Silent failures** — every AI call returns a normal JSON error instead
  of throwing, and the UI shows the actual error message in the chat/report
  view instead of hanging or showing nothing.
- **Model availability** — if `gemini-1.5-flash` is retired for your
  project, the backend automatically retries with the next model in the
  fallback list rather than failing outright.

## Project structure

```
api/            Vercel serverless functions (Gemini calls, key stays server-side)
src/components/ Reusable UI: forms, modals, badges, layout
src/pages/      One file per route (Dashboard, Inventory, AI Assistant, etc.)
src/context/    Global inventory state + localStorage persistence
src/utils/      Stock/expiry status calculations, formatting helpers
src/data/       Demo inventory data (clearly flagged, removable in Settings)
```

## Demo data

The app ships with realistic demo medicines covering every status (in
stock, low stock, out of stock, expired, expiring soon, safe) so the
dashboard and AI features have something to show immediately. Clear it
any time from **Settings → Clear Demo Data**.
