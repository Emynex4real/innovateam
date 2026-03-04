# InnovaTeam: Project Standards & AI Core Memory

> **Canonical file:** `CLAUDE.md` in the project root. This is a mirror for Antigravity agent compatibility.

## Quick Reference

| Layer               | Stack                                                                         |
| ------------------- | ----------------------------------------------------------------------------- |
| **Frontend**        | React 18 + CRA (CRACO) + JavaScript + Tailwind CSS + Radix UI + Framer Motion |
| **Routing**         | react-router-dom v6                                                           |
| **Backend**         | Express.js v4 + Node.js                                                       |
| **Database & Auth** | Supabase (supabase-js v2)                                                     |
| **Caching**         | Upstash Redis + node-cache                                                    |
| **AI**              | Google Gemini                                                                 |
| **Deploy**          | Vercel (frontend) + VPS/PM2 (backend)                                         |

## Key Rules

1. **JavaScript only** — no TypeScript in this project. Files are `.js` / `.jsx`.
2. **CRA + CRACO** — not Next.js. No server components, no App Router, no `pages/` directory routing.
3. **Context API** for state — `AuthContext`, `AdminContext`, `WalletContext`, `DarkModeContext`.
4. **Service layer pattern** — all API calls go through `src/services/*.service.js`, never inline in components.
5. **Supabase via backend** — React → Express API → Supabase. Avoid direct Supabase queries from components.
6. **Sanitize all input** — use `dompurify`/`xss` on both client and server.
7. **Plan before coding** — for 2+ file changes, write a brief plan and get approval first.

See `CLAUDE.md` for full details.
