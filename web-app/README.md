# Elite-Data-Intelligence Web Application

Public marketing site + Client Portal + Internal Ops Dashboard.

**Full requirements:** see [`/docs/PRD-web-app.md`](../docs/PRD-web-app.md)

## Design Reference
Primary visual inspiration: [Mission responsive landing page](https://dribbble.com/shots/27388289-Mission-responsive-landing-page) by Taras Migulko (forge®).

- Bold, oversized editorial typography
- High-contrast black / white layouts
- Premium, structured aesthetic
- Cinematic scrolling feel
- Restrained yellow accent
- Fully responsive

## Current Scaffold Status

| Area | Status |
|------|--------|
| Next.js App Router + TypeScript | ✅ Initialized |
| Tailwind + editorial design tokens | ✅ Configured |
| Marketing home page (Hero → Contact) | ✅ Scaffolded |
| Client Portal shell (`/portal`) | ✅ Placeholder |
| Internal Ops Dashboard (`/ops`) | ✅ Placeholder |
| Auth / live agent chat / data | Next iteration |

## How to Run Locally

```bash
cd web-app
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Route Map

- `/` — Public marketing site
- `/portal` — Client portal (auth to be added)
- `/ops` — Internal ops dashboard (restricted)

## Next Steps (per PRD)
1. Wire booking form to structured store + notifications
2. Add authentication (Clerk or Auth.js)
3. Connect Customer Support Agent chat widget
4. Pull real project status into portal
5. Populate ops dashboard with pipeline / credit / agent health data

All further development must follow the PRD in `/docs/PRD-web-app.md`.
