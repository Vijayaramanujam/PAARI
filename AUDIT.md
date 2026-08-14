# PAARI Platform v2 Redesign Audit Report

This audit report documents the current technical status, architectural features, routing tables, and security mechanisms of the PAARI full-stack platform.

---

## 1. REST API Endpoints & Wiring Inventory

### Public Endpoints (Permitted in WebSecurityConfig)
- `GET /` — Serves main index.html React bundle
- `GET /index.html` — React landing page template
- `GET /assets/**` — CSS and JS bundles
- `POST /api/auth/register` — Standard credentials signup. Maps profile entities (Donor, Receiver, Volunteer)
- `POST /api/auth/login` — Returns JS Web Token (JWT) credentials
- `GET /api/analytics/summary` — Public statistics returned to the home landing page
- `GET /h2-console/**` — Developer database interface (in-memory H2)

### Authenticated Endpoints
- `POST /api/donations` — Creates a surplus food listing (Donor only)
- `GET /api/donations/my` — Get active listings by donor (Donor only)
- `GET /api/donations/available` — Returns open, non-expired listings (Receiver/Donor/Volunteer)
- `GET /api/donations/{id}` — Returns record details
- `PUT /api/donations/{id}/status` — Changes status of donation
- `POST /api/requests` — Portions request for a food listing (Receiver only)
- `GET /api/requests/my` — Lists claims from current Receiver / requests routing for Donor
- `GET /api/deliveries/available` — Unassigned food runs list (Volunteer/Admin)
- `GET /api/deliveries/my` — Volunteer’s active claimed jobs (Volunteer only)
- `POST /api/deliveries/assign` — Claim a delivery task (Volunteer only)
- `PUT /api/deliveries/{id}/status` — Progress milestones (Picked up -> Delivered)
- `GET /api/deliveries/{id}/route` — Route overview and fallback coordinates
- `POST /api/routes/calculate` — Calls route service with coordinates
- `GET /api/matches/donation/{id}` — Runs smart geographic proximity calculations
- `POST /api/payments` — CSR sponsorships simulator (Donor/Admin)
- `GET /api/payments/donation/{id}` — Financial records lookup
- `POST /api/feedback` — Submit rating feedback on a transaction partner
- `GET /api/admin/users` — Read all partner accounts (Admin only)
- `PUT /api/admin/users/{id}/status` — Change validation state (Admin only)

---

## 2. Front-End / Back-End Integration Discrepancies

During Phase 1 walkthrough testing, two primary routing discrepancies were identified on the Admin dashboard:
1. **User Validation Path**: The React `AdminPortal.jsx` issues a `PUT` request to `/api/admin/users/{userId}/toggle-status`, but the Spring Boot `AdminController.java` only exposes `/users/{id}/status` taking a `@RequestParam UserStatus status`.
2. **Impact Charts Path**: `AdminPortal.jsx` fetches graphs from `/api/analytics/charts`, which returns a 404 on the backend since only the general public `/summary` is implemented.

*These will be corrected in the stabilization phase.*

---

## 3. Seed Metadata (Users & Credentials)

For testing and local verification, the application seeds 4 profiles corresponding to the core roles:
- **System Admin**: `admin@paari.org` / `admin123`
- **Food Donor (Bakery)**: `donor@paari.org` / `donor123`
- **Receiver (NGO Shelter)**: `ngo@paari.org` / `ngo123`
- **Volunteer Courier**: `volunteer@paari.org` / `volunteer123`

---

## 4. Production Security Analysis

### JWT Validation Configuration
- Secret key length exceeds 256 bits, conforming to HS256 encryption specifications.
- Expiration interval is 24 hours (86,400,000 ms), suitable for active portal sessions.

### Security Gaps
- In-memory database settings (H2 console frameOption disable) are enabled for development comfort.
- In production, these console routes must be restricted, and a persistent PostgreSQL schema should replace the test datasource.
- Mail triggers use local SMTP log dumps; need an active provider integration (e.g. SendGrid) for production.
