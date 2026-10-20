# miata-web — MIATA website and portals (React)

The MIATA public website, converted from the original HTML pages to React with the same design, layout and content, plus
the sign-in pages and the four role dashboards — **Admin, Student, Professor, Agent**. It talks to
[miata-api](../miata-api) over REST.

React 19 · React Router 7 · Vite 8 · the original Eduact theme (Bootstrap, animate.css, owl carousel, …) for the website ·
a separate design system for the dashboards.

## Requirements

- Node.js 20.19+ or 22.12+ (developed on 22)
- A running miata-api (see its README) for sign-in, dashboards and the contact form. The website pages themselves render without it.

## Setup and run

```bash
cd miata-web
npm install
cp .env.example .env     # optional — the defaults suit local development
npm run dev              # http://localhost:5173
```

In development the Vite server forwards `/api` to `http://localhost:5000` (miata-api), so start the API first:
`npm run dev` (live data, `miata_live_db`) or `npm run dev:mock` (mock data, `miata_mock_db`) in `miata-api`.

| Command | What it does |
|---|---|
| `npm run dev` | Development server with hot reload |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serve the production build locally (also proxies `/api`) |
| `npm test` | Unit tests (Vitest) |
| `npm run lint` · `npm run format` | ESLint · Prettier |

### Configuration (`.env`)

| Variable | Purpose |
|---|---|
| `VITE_API_URL` | Origin of miata-api when it is hosted on a different origin, e.g. `https://api.miata.example`. Leave empty when `/api` is served by the same origin (development proxy or a reverse proxy). Built into the bundle. |
| `VITE_API_PROXY_TARGET` | Development / preview only: where `/api` is forwarded (default `http://localhost:5000`). |

Only `VITE_*` values reach the browser — never put secrets in this file.

## Pages

| URL | Page |
|---|---|
| `/` · `/about` · `/courses` · `/fees-and-scholarships` · `/contact` | Website (converted from `index.html`, `about.html`, `course.html`, `feesandacollar.html`, `contact.html`) |
| `/login` | Choose a portal: **Admin, Student, Professor, Agent** |
| `/login/admin` · `/login/student` · `/login/professor` · `/login/agent` | Role login (the original login page design). The student page also has the Register box. |
| `/register` (`?ref=CODE` from an agent's referral link) · `/forgot-password` · `/reset-password` | Student registration and password reset, in the website design |
| `/admin/*` · `/agent/*` · `/professor/*` · `/student/*` | The four dashboards (fee payments: `/admin/payments`, `/admin/payments/:paymentId`; student fees: `/student/fees`; agents register students with **Apply Now** on `/agent` and `/agent/students`) |

Old addresses keep working: `index.html`, `about.html`, `course.html`, `feesandacollar.html`, `contact.html`, `login.html`
and `/portal/*` redirect to the new routes.

**Sign-in flow.** A role login sends the chosen role to the API, which refuses accounts of another role (the page then links
to the right login). After sign-in the user lands on their dashboard — or on the dashboard page they originally asked for.
Opening a dashboard while signed out leads to that role's login page. Signed-in users who open `/login` go straight to their
dashboard; logging out returns to the role's login page.

## How it is organised

```
miata-web/
├── public/assets/        the original website's CSS, fonts, images, brochure, intro video and the 5 jQuery plugins still used
├── index.html            links the website theme stylesheets (exactly as the original pages did)
└── src/
    ├── website/
    │   ├── content/      site.js (contact details, menus) · programme.js (phases, modules, fees) · highlights.js (locations, graduates, testimonials, facts)
    │   ├── layout/       WebsiteLayout, SiteHeader (+ sticky header), MobileNav, SiteFooter, PageHeader, Preloader, CustomCursor, FloatingContact, WebsitePage
    │   ├── sections/     reusable page sections (WelcomeHero, CareerHero, AboutSection, WhyChooseSection, ProgramPhasesSection,
    │   │                 LocationsSection, GraduatesSection, FactsSection, TestimonialsSection, CurriculumSection, FeesSection, ContactSections)
    │   ├── pages/        HomePage, AboutPage, CoursesPage, FeesPage, ContactPage, NotFoundPage
    │   └── theme/        themeAssets.js (stylesheets + plugin loader) · useThemePlugins.js (React port of eduact.js) · website.css
    ├── features/
    │   ├── auth/         LoginRolesPage, RoleLoginPage, RegisterPage, Forgot/ResetPasswordPage, AuthContext, roles.js
    │   ├── admin/ agent/ professor/ student/ shared/    dashboard pages per role
    ├── layouts/          DashboardLayout, Sidebar, top bar pieces
    ├── components/       dashboard UI kit (tables, cards, forms, modals, charts)
    ├── routes/           AppRoutes, RequireAuth / PortalScope / GuestOnly, navigation.js, ScrollToTop
    ├── hooks/ services/api.js utils/
    └── styles/           dashboard styles (scoped — see below)
```

### Website theme in React

- Pages are composed from section components; repeated cards and lists come from the `content/` data files, so text is edited in one place.
- `useThemePlugins` re-creates what the theme script did — scroll reveal (WOW), counters, the stretched hero column, owl carousels, the video popup, hover tilt and parallax headers — for each page, and tears it down when the page changes. Navigation, the mobile menu, the sticky header, accordions and the contact form are plain React.
- The contact form validates like the original (same messages) and stores the enquiry through `POST /api/enquiries`.

### Keeping the two designs apart

The website uses Bootstrap and the Eduact theme; the dashboards use their own styles. Neither may leak into the other:

- The theme stylesheets are linked in `index.html` with `data-website-css` and switched off (`media="not all"`) while a dashboard is shown, and on again for website pages — instantly, without reloading them.
- All dashboard CSS is wrapped in `:where(.lms) { … }`; `PortalScope` puts the `lms` class on `<html>` only for dashboard routes. `:where()` keeps every selector's specificity unchanged.

## Deployment

1. `npm run build` → upload `dist/` to any static host or web server.
2. Configure the usual single-page fallback: unknown paths (including the old `*.html` addresses) must return `index.html`.
   nginx: `try_files $uri /index.html;`
3. Point `/api` at miata-api — either a reverse-proxy rule on the same domain (simplest; cookies stay first-party), or build with
   `VITE_API_URL=https://api.example` and set miata-api's `FRONTEND_URL` to this site's URL (and `COOKIE_SAMESITE=none` over HTTPS if the domains differ).

## Verification done

- Every converted page compared with its original HTML page at desktop (1440 px) and mobile (390 px) widths: identical section order, identical visible text and identical page height, plus side-by-side screenshots. The only differences come from the corrections listed below (the corrected contact-page title is shorter, so on mobile that page is 36 px shorter).
- 45 end-to-end checks (development server and production build): accordions, mobile menu, sticky header, carousels, video popup, counters, contact form validation and submission, the four role logins, wrong-role and wrong-password handling, protected-route redirects, role isolation, logout, old-URL redirects — no console errors.
- Live-data run on a copy of the live database: records created through the app appear in all four dashboards.

## Content corrections made during the conversion

- Contact page banner said "Fees & Scholarships" → "Contact Us".
- Footer "Home" link pointed to the Courses page → Home; footer Programs links (`#`) → Courses page.
- "Call Now" button pointed to the Courses page → calls `+61468474480`.
- Login page: "Forgot Passowrd?" → "Forgot Password?", "Username of email" → "Email address".
- Logo alt text "Eduact" → "MIATA" (decorative images now have empty alt text).
- Contact page address spacing ("Queen St,Melbourne") aligned with the footer.

Development plan and pending work: [PLAN.md](PLAN.md).
