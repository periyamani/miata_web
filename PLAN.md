# miata-web — development plan

## Goal

One React application for the MIATA website and the four role portals: the website looks and behaves exactly as the
original HTML pages, the login page offers one login per role, and each role lands on its own dashboard. Data comes only
from miata-api over REST.

## Module structure

| Area | Folder | Contents |
|---|---|---|
| Website content | `src/website/content` | Text and lists shown on the pages (contact details, menus, phases, modules, fees, locations, graduates, testimonials, facts) |
| Website layout | `src/website/layout` | Header + sticky header, mobile menu, footer, page banner, preloader, cursor, WhatsApp/call buttons, page wrapper |
| Website sections | `src/website/sections` | One component per section type, reused across pages (props for the home-page-only buttons) |
| Website pages | `src/website/pages` | Home, About, Courses, Fees & Scholarships, Contact, 404 — compositions of sections |
| Theme bridge | `src/website/theme` | Stylesheet switch, plugin loader, React port of `eduact.js`, small additions (`website.css`) |
| Sign-in | `src/features/auth` | Portal chooser, role login, registration, password reset, session context, role metadata |
| Dashboards | `src/features/{admin,agent,professor,student,shared}`, `src/layouts`, `src/components` | The four portals and their UI kit |
| Plumbing | `src/routes`, `src/services/api.js`, `src/hooks`, `src/utils` | Routing and guards, REST client (in-memory access token, refresh cookie), shared hooks |

## Implementation steps

| # | Step | Status |
|---|---|---|
| 1 | Dashboards for Admin, Agent, Professor, Student (from the four reference images) with charts, tables, forms | Done |
| 2 | Move the React app to `miata-web`, serve it at `/` (no `/portal` base), API through REST only | Done |
| 3 | Convert the six HTML pages: parse the markup into JSX, split into layout + reusable sections, move repeated content into data files | Done |
| 4 | Copy only the assets the pages and stylesheets use into `public/assets` (85 files); drop unused vendors and images | Done |
| 5 | Port the theme script: scroll reveal, counters, stretched column, carousels, video popup, tilt, parallax; React state for menu, sticky header, accordions | Done |
| 6 | Contact form → `POST /api/enquiries` with the original validation messages | Done |
| 7 | Login: `/login` chooser with four portals, `/login/:role` pages in the original login design, role sent to the API, wrong-portal guidance | Done |
| 8 | Registration, forgot and reset password in the website design; route guards redirect to the right role login | Done |
| 9 | Style isolation: theme stylesheets toggled per area, dashboard CSS scoped under `:where(.lms)` | Done |
| 10 | Redirect old `.html` and `/portal/*` addresses | Done |
| 11 | Verify: page-by-page comparison with the originals (desktop + mobile), 45 end-to-end checks on dev and production builds, real-data run, lint, unit tests, build | Done |
| 12 | Batch-wise workflow in the existing screens: admin **Batches** page (list, detail with Students / Courses & Materials / Professors / Assignments / Submission tracking tabs), batch filters and columns on students, assignments, submissions and videos, batch card on the student profile, module/video availability, "Batches" tab on courses; professor **My Batches** dashboard card, batch filters, batch or selected-student assignments; student **My Batch** card and batch-only material. Verified in headless Chrome for every role (34 page checks plus the full admin → professor → student → professor → admin flow) | Done |
| 13 | Fees, payments, access periods and agent applications: admin **Fee Payments** page (stats, filters, verification dialog with the proof image, fee position and approve / reject / back to pending), "Fees & payments" card and editable access period per enrolment on the student page (with an "access ended" alert), course fee field, fee settings (currency, transfer instructions), dashboard alert for payments to verify; student **Fees & Payments** page (totals, per-course fees, payment history, how to pay, proof upload) and dashboard fee card / access-ending warning; agent **Apply Now** on the dashboard and the referred-students page. Verified in headless Chrome (14 checks across agent, student and admin, desktop and phone width) | Done |
| 14 | Course timetables in the admin Courses module: **Import Timetable** on the Courses page with a preview (what is created and reused, lecturer / professor matches, module mapping for existing modules with other names, sessions placed by judgement), academic year on the list, academic year / dates / timetable notes in the course form, programme week and lecturer in the lesson form, numbered curriculum topics and weekly sessions under Modules & Lessons, and a **Weekly Timetable** tab from `GET /admin/courses/:id/timetable` (lecturer allocations with add / edit / remove, week / module / lecturer filters, week-by-week sessions with "this week" and "module complete", timetable notes). Verified in headless Chrome (41 checks, desktop and phone width) | Done |
| 15 | Lecturers as professors and portal timetables: module professor dropdown limited to the course's lecturers (with a hint while none is linked, and a marker on module professors who are not lecturers); **Create account** for an unlinked lecturer on the Weekly Timetable tab (links it and assigns its modules; ✓ on assigned module chips); professor and student **Timetable** pages and "this week" dashboard cards, sharing the admin timetable components (`features/shared`); the professor's own sessions highlighted. Verified in headless Chrome across the four portals (28 checks) | Done |
| 16 | Curriculum actions and module status: move up / down as one grouped control (disabled at the ends, one move at a time), hover / keyboard-focus tooltips on every module and lesson action (shared `Tooltip`, `Button tooltip`, `ReorderButtons`), delete turns red on hover, actions under the title on phones; module status badge (who / when on hover) under Modules & Lessons; professor **My Modules** dashboard card (completed / in progress bar, status tabs, modules by course with lessons, weeks and professors, an actions menu per module to set Not Started / In Progress / Completed and open the timetable). Verified in headless Chrome (admin and professor, desktop and phone width) | Done |

## Pending tasks / next steps

- **Hosting**: configure the single-page fallback and the `/api` route (or `VITE_API_URL`) on the chosen host — see README › Deployment.
- **Content owner review** of the small corrections listed in the README (contact title, footer links, "Call Now", login typos).
- **Chat launcher**: every original page loaded a third-party script (`collectcdn.com/launcher.js`, id `6ab6bdc7…`); it is kept on website pages. Confirm it is still wanted.
- Placeholder content inherited from the theme: the three testimonials use template text and names, and the location/programme cards link nowhere. Replace with real content when available.
- Optional: lazy-load the website sections below the fold to reduce the first download, and self-host the Google Fonts.
