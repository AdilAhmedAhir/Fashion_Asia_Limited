# Fashion Asia Limited — Website

A fully **static, frontend-only** marketing site built with Next.js + Tailwind.
There is **no database and no backend** — it deploys to Vercel with zero
configuration and no environment variables.

## Deploy on Vercel

1. Push this repo to GitHub.
2. In Vercel, **Add New → Project** and import the repo.
3. Framework preset: **Next.js** (auto-detected). Leave everything default.
4. Click **Deploy**. No environment variables are required.

Every `git push` to the connected branch triggers an automatic redeploy.

## Editing content (no code knowledge needed for most changes)

| What you want to change | Where |
|---|---|
| Text, stats, products, certifications, contact info | `src/lib/site-content.ts` |
| Job openings (Careers page) | `JOBS` array in `src/lib/site-content.ts` |
| Reports & publications | `REPORTS` array in `src/lib/site-content.ts` |
| Leadership profiles | `LEADERS` array in `src/lib/site-content.ts` |
| Media Center gallery | `MEDIA_ASSETS` array in `src/lib/site-content.ts` |
| Photos | drop files in `public/images/client/` and reference `/images/client/<file>` |
| Hero / About videos | replace `public/videos/hero.mp4` / `public/videos/about.mp4` |

After editing, commit and push — Vercel rebuilds automatically.

## Forms

Contact, Career, and Grievance forms are **backend-free**: submitting opens the
visitor's email app with the details pre-filled, addressed to
`admin@fashionasialtd.com` (change this via `CONTACT_EMAIL` in
`src/lib/site-content.ts`).

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
```
