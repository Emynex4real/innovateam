# InnovaTeam: Project Standards & AI Core Memory

## 1. Project Context

- **App Name:** InnovaTeam
- **Domain:** Educational platform for JAMB and WAEC exam preparation.
- **Goal:** High performance, secure student data handling, and an intuitive frontend experience.

## 2. Tech Stack & Boundaries

### Frontend (React SPA)

- **Framework:** React 18 with Create React App (CRA), extended via **CRACO** for webpack customization.
- **Language:** JavaScript (`.js` / `.jsx`). Path aliases are configured in `jsconfig.json` with `baseUrl: "src"`.
- **Routing:** `react-router-dom` v6. All routes are defined in `src/App.js` and `src/routes/`.
- **Styling:** Tailwind CSS with `@tailwindcss/forms` and `tailwindcss-animate`. Dark mode uses the `class` strategy. Custom design tokens (shadcn/ui-style HSL variables) are defined in `tailwind.config.js`.
- **UI Components:** Radix UI primitives (`@radix-ui/react-checkbox`, `@radix-ui/react-separator`, `@radix-ui/react-slot`), `lucide-react` icons, `framer-motion` for animations.
- **State Management:** React Context API. **The canonical AuthContext lives inline in `src/App.js`** (exports `useAuth`). Import auth from `'../App'` or `'../../App'`. The files `contexts/AuthContext.jsx` and `contexts/SupabaseAuthContext.jsx` exist but are deprecated — do not use them for new code. Other active contexts: `AdminContext`, `WalletContext`, `DarkModeContext`, `ThemeContext`.
- **Charts & Data:** Recharts for data visualization, `jspdf` + `jspdf-autotable` for PDF generation, KaTeX for math rendering.
- **Notifications:** `react-hot-toast` and `react-toastify`.
- **Error Tracking:** Sentry (`@sentry/react`).

### Backend (Express API — `server/`)

- **Runtime:** Node.js with Express.js v4. Entry point is `server/server.js`.
- **Database & Auth:** Supabase (`@supabase/supabase-js` v2). Supabase client is at `server/supabaseClient.js`.
- **AI Integration:** Google Gemini (`@google/generative-ai`).
- **Caching:** Upstash Redis (`@upstash/redis`) + in-memory `node-cache`.
- **Security:** `helmet`, `cors`, `express-rate-limit`, `bcryptjs`, `jsonwebtoken`, `xss`, `dompurify`, `validator`.
- **File Processing:** `multer` (uploads), `pdf-parse`, `mammoth` (Word docs), `sharp` (images), `tesseract.js` (OCR).
- **Logging:** Winston (`winston`) + Morgan (`morgan`).
- **Email:** Resend (`resend`).
- **Monitoring:** Sentry (`@sentry/node`), DataDog via `hot-shots`.

### Deployment

- **Frontend:** Vercel (see `vercel.json`, `.vercelignore`). Build command: `CI=false craco build`.
- **Backend:** VPS with PM2 (see `ecosystem.config.js`, `deploy-vps.sh`, `render.yaml` as alternative).

## 3. Architecture & Directory Structure

```
src/
├── api/            # API client helpers
├── components/     # React components (organized by feature domain)
│   ├── ui/         # Reusable UI primitives (Button, Card, Dialog, etc.)
│   ├── admin/      # Admin-specific components
│   ├── auth/       # Authentication components
│   ├── forums/     # Forum feature components
│   ├── messaging/  # Chat/messaging components
│   ├── exam/       # Exam-related components
│   ├── student/    # Student-facing components
│   └── tutor/      # Tutor-facing components
├── config/         # App configuration
├── contexts/       # React Context providers (Auth, Admin, Wallet, Theme, etc.)
├── hooks/          # Custom React hooks
├── layouts/        # Page layout wrappers (UserLayout, AdminLayout)
├── pages/          # Route-level page components
├── routes/         # Route definitions and guards
├── services/       # API service modules (one per domain)
├── utils/          # Utility functions
├── ml/             # ML/prediction utilities
└── styles/         # Additional CSS

server/
├── controllers/    # Express route handlers
├── middleware/      # Express middleware (auth, rate-limit, validation, etc.)
├── routes/         # Express route definitions
├── services/       # Server-side business logic
├── models/         # Data models
├── migrations/     # Database migrations
├── database/       # DB config and helpers
├── utils/          # Server utility functions
├── validators/     # Input validation schemas
└── scripts/        # Server maintenance scripts
```

## 4. AI Workflow Directives

- **Avoid Infinite Loops:** If a file is too large or a problem requires heavy computation, break it down into 3 smaller steps. Do not attempt massive single-shot refactors.
- **Brevity:** Do not output full files if you only changed one line. Output the specific code block with a few lines of context above and below.
- **No Laziness:** Do not use placeholders like `// ...existing code...` in a way that breaks the application if copy-pasted. Be explicit.
- **Plan First:** For any non-trivial change (2+ files or new logic), write a brief plan and get user approval before writing code.
- **Scope Discipline:** Implement only what is requested. Do not refactor unrelated files.
- **Self-Learn:** When corrected, fix the error AND add to the Lessons Learned ledger below.

## 5. Supabase & Data Fetching Rules

- **Client-Side Auth:** The canonical auth provider is `SupabaseAuthProvider` in `src/App.js`. Import `useAuth` from `'../App'` (or `'../../App'`). It provides: `user`, `loading`, `signUp`, `signIn`, `signOut`, `resetPassword`, `isAuthenticated`. Do NOT import from `contexts/AuthContext.jsx` or `contexts/SupabaseAuthContext.jsx` — those are deprecated.
- **Server-Side Auth:** Use JWT verification in Express middleware (`server/middleware/`). Never trust client-sent user IDs without validating the JWT.
- **Row Level Security (RLS):** Assume all Supabase tables have RLS enabled. Write database queries mindful of user context.
- **Data Fetching Pattern:** Frontend services (in `src/services/`) call Express API endpoints. Express controllers call Supabase. Avoid direct Supabase calls from React components — use service modules.
- **Environment Variables:** All secrets go in `.env.local` (frontend) and `server/.env` (backend). Never commit `.env` files. Reference `.env.example` for required keys.

## 6. Component & Code Standards

### Components

- Organize components by feature domain under `src/components/` (e.g., `forums/`, `messaging/`, `ui/`).
- Reusable primitives go in `src/components/ui/`.
- Use descriptive prop names. `userData` is good; `data` is bad.
- Use `ErrorBoundary` component for graceful error handling.

### Services

- One service file per feature domain (e.g., `auth.service.js`, `wallet.service.js`).
- All API calls go through the centralized `src/services/api.js` Axios instance.
- Handle errors consistently — catch and re-throw with meaningful messages.

### Security

- Sanitize all user input with `dompurify` / `xss` before rendering or storing.
- Use `helmet` and CORS middleware on all Express routes.
- Apply rate limiting (`express-rate-limit`) to sensitive endpoints (login, payments, AI).
- Validate input on the server side with `express-validator` / `validator`.

### Routing & Auth Guards

- Protected routes use `PrivateRoute` / `ProtectedRoute` / `RoleProtectedRoute` components.
- Admin routes additionally use `AdminProtectedRoute`.
- Role checks: `admin`, `tutor`, `student` — defined in context and guarded at the route level.

### Performance

- Use `React.lazy()` and `Suspense` for code-splitting large pages.
- Leverage Redis/node-cache on the backend for expensive queries.
- Minimize `useEffect` — prefer derived state and memoization (`useMemo`, `useCallback`).

### Testing

- Frontend: Jest + React Testing Library (via `craco test`).
- Backend: Jest + Supertest.
- Test files live alongside source: `Component.test.jsx` or in `__mocks__/` directories.

---

## 7. [LESSONS LEARNED] - The AI Correction Ledger

_Agent Instructions: Append a new bullet point here immediately after making a mistake and receiving a correction from the user. Format: **[Date] - [Topic]:** Rule._

- [2026-03-02] - Baseline: Initialized self-learning protocol.
- [2026-03-02] - Stack Accuracy: Always audit the actual `package.json` and source files before documenting the tech stack. Never assume a framework (e.g., Next.js) without verifying it is actually installed and used.
- [2026-03-02] - Auth Context Duplication: The app has 3 `useAuth` exports (`App.js`, `contexts/AuthContext.jsx`, `contexts/SupabaseAuthContext.jsx`). Only the `App.js` one is canonical — always import from there. The others are deprecated.
- [2026-03-02] - Route Protection: Every route that accesses user data MUST be wrapped in `ProtectedRoute` or `RoleProtectedRoute`. Never leave routes unprotected, even for "legacy" backwards-compatibility paths.
- [2026-03-02] - Production Console Logs: Never leave raw `console.log()` in production code. Guard with `if (process.env.NODE_ENV === 'development')` or use the logger utility.
- [2026-03-02] - Supabase Anon Key Format: As of 2026, Supabase anon keys use the `sb_publishable_` prefix format, not the legacy JWT `eyJ...` format.
- [2026-03-03] - Subscription DB Schema: The `tutor_subscriptions` table uses columns: `end_date`, `payment_method`, `paystack_reference`, `paystack_subscription_code`, `paystack_email_token`, `cancelled_at`, `auto_renew`, `next_payment_date`, `renewal_count`. Always verify columns exist before inserting — run `add_subscription_end_date.sql` and `add_recurring_subscription_fields.sql` migrations first.
- [2026-03-03] - Subscription Statuses: Valid `tutor_subscriptions.status` values are: `active`, `grace_period`, `past_due`, `expired`, `cancelled`, `replaced`. When querying the current plan, always match `IN ('active', 'grace_period', 'past_due')` — not just `active`. Both `subscriptionLimits.js` middleware and `subscription.service.js` must use the same status set.
- [2026-03-03] - Grace Period Dual Tables: Resource-level grace (students/questions/tests over-limit) uses the `subscription_grace_periods` table. Subscription-level grace (plan expired) uses the `status = 'grace_period'` on `tutor_subscriptions`. These are separate systems — clear `subscription_grace_periods` on plan upgrade.
- [2026-03-03] - Paystack Recurring Billing: Use Paystack Plans API (`/plan`) to create recurring plans, then pass `plan: planCode` in `transaction/initialize`. Paystack auto-creates a subscription after first payment and sends `subscription.create` webhook with `subscription_code` and `email_token`. Store both — they are required for enable/disable API calls.
- [2026-03-03] - Webhook Idempotency: Always check for existing processed transactions before handling `charge.success` webhooks. Use `Transaction.findByPaystackReference(reference)` to prevent double-processing. Return HTTP 200 even on error to prevent Paystack retries.
- [2026-03-03] - Payment Service Architecture: `payment.service.js` uses `this.paystackRequest()` helper for all Paystack API calls — reuse it. Don't create new raw `https.request` blocks. The helper handles JSON parsing, error handling, and auth headers.
- [2026-03-10] - Auth Token Handling: Never blindly send `Bearer ${session?.access_token}` — if session is null, this sends `Bearer undefined` which triggers `NO_TOKEN` 401s. Always validate the token exists first, and fall back to `supabase.auth.refreshSession()` if missing. Apply this pattern in all frontend service `getAuthHeader()` functions.
