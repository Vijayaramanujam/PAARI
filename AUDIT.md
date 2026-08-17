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

1. **User Validation Path**: The React `AdminPortal.jsx` issues a `PUT` request to `/api/admin/users/{userId}/toggle-status`. This endpoint is fully mapped in `AdminController.java`.
2. **Impact Charts Path**: `AdminPortal.jsx` fetches graphs from `/api/analytics/charts`. The endpoint exists in `AnalyticsController.java` but requires authentication because it is not permited in `WebSecurityConfig.java`. This is correct by design since it is restricted to logged-in portal users (like Admin).

---

## 3. Database & Connection Configuration Gaps

1. **PostgreSQL Production Dependency**:
   - The project requirements specify using **PostgreSQL** in production, but `backend/pom.xml` currently defines a `mysql-connector-j` dependency instead of `postgresql`.
   - The production profile `backend/src/main/resources/application-prod.yml` points to a MySQL server (`jdbc:mysql://...`) instead of PostgreSQL.
2. **SQL Schema Dialect**:
   - `backend/src/main/resources/schema.sql` utilizes H2-specific/MySQL-specific definitions (`id BIGINT AUTO_INCREMENT PRIMARY KEY`) which will fail in standard PostgreSQL deployments.

---

## 4. Test Orchestration Gaps

- There are **no automated test files** (unit, integration, or contract tests) present in the `backend/src/test` directory. We must supply verification test suites.

---

## 5. Seed Metadata (Users & Credentials)

For testing and local verification, the application seeds 4 profiles corresponding to the core roles:
- **System Admin**: `admin@paari.org` / `admin123`
- **Food Donor (Bakery)**: `donor@paari.org` / `donor123`
- **Receiver (NGO Shelter)**: `ngo@paari.org` / `ngo123`
- **Volunteer Courier**: `volunteer@paari.org` / `volunteer123`
