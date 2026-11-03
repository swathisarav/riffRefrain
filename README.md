# 🎸 RiffRefrain

A practice tracker for musicians. Log practice sessions, keep a streak going, track tempo progress on the riffs and songs you're learning, and set weekly goals.

- **Dashboard**: current and best streak, minutes practiced this week against your goal, a 14-day chart, the riffs you're learning, and recent sessions
- **Sessions**: your full practice log, grouped by day, with filters for focus area and riff
- **Riffs**: songs, riffs and exercises with status, tuning, and current vs. target BPM. Logging a faster tempo updates the riff's best automatically.
- **Goals**: a weekly minutes target and dated milestones you can check off

Built with React, Vite, Tailwind CSS, TanStack Query and [Supabase](https://supabase.com) (accounts and Postgres database). It's hosted as a static site on GitHub Pages.

---

## 1. Set up Supabase (one time, free)

1. Create a project at <https://supabase.com/dashboard>.
2. Open **SQL Editor → New query**, paste the contents of [`supabase/schema.sql`](supabase/schema.sql) and click **Run**. This creates the tables and the Row Level Security policies that keep each user's data private.
3. Open **Project Settings → API** (or **API Keys**) and copy:
   - the **Project URL**
   - the **anon / publishable** key. This key is meant to be public. Never use the `service_role` / secret key in this app.
4. Open **Authentication → URL Configuration**:
   - set **Site URL** to your GitHub Pages URL, e.g. `https://<your-username>.github.io/<repo-name>/`
   - add `http://localhost:5173/**` and `https://<your-username>.github.io/<repo-name>/**` under **Redirect URLs**

   (Optional) Under **Authentication → Providers → Email** you can turn off *Confirm email* so new accounts can sign in immediately.

## 2. Run locally

```bash
cp .env.example .env.local   # then paste your URL and key into .env.local
npm install
npm run dev                  # http://localhost:5173
```

## 3. Deploy to GitHub Pages

1. Create a GitHub repo and push this folder to its `main` branch:
   ```bash
   git init && git add . && git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. In the repo, open **Settings → Secrets and variables → Actions → New repository secret** and add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
3. Open **Settings → Pages** and set **Source** to **GitHub Actions**.
4. Open **Actions → Deploy to GitHub Pages → Run workflow**. After that, every push to `main` redeploys automatically.

Your app will be live at `https://<your-username>.github.io/<repo-name>/`.

## Project structure

```
src/
  App.jsx              Routing and auth gate
  pages.config.js      Registers pages; each key becomes a route (/#/Dashboard, /#/Riffs, …)
  Layout.jsx           Header, navigation and the global "Log practice" dialog
  pages/               Dashboard, Sessions, Riffs, Goals
  components/          Forms, stats widgets, login, toaster, modal
  lib/
    supabase.js        Supabase client
    AuthContext.jsx    Session state, sign out, weekly goal (stored in user metadata)
    api.js             React Query hooks for each table
    utils.js           Date helpers, streak and stat calculations, constants
supabase/schema.sql    Database tables and security policies
```

To add a page, create `src/pages/MyPage.jsx`, register it in `pages.config.js` and add it to `NAV` in `Layout.jsx`.

### Why the URLs have `#/`

GitHub Pages can't send unknown paths to `index.html`, so a refresh on `/Riffs` would return a 404. The app uses hash routing (`/#/Riffs`), which works on any static host with no extra setup.
