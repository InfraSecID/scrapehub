# ScrapeHub Bugfix and Audit Report

Date: October 20, 2026  
Repository: `/home/hidayat/scrapehub`  
Scope: Backend (`/home/hidayat/scrapehub/backend`) & Frontend (`/home/hidayat/scrapehub/frontend`)

---

## 1. Summary of Audit Findings

A comprehensive audit was performed across all TypeScript source files in both the backend and frontend codebases. The audit targeted syntax and type errors, unused imports, missing async/await handling, empty catch blocks, input validation gaps, response structure inconsistencies, route mismatches, middleware gaps, environment variable parity, and React lifecycle edge cases.

---

## 2. Bugs Found and Fixed

### A. Backend (`/backend/src`)

| # | File & Location | Description of Issue | Resolution Implemented |
|---|---|---|---|
| 1 | `backend/src/routes/auth.routes.ts` (lines 17–45) | **Missing Email & Type Validation**: `POST /api/auth/login` accepted any truthy value for email without type validation or email regex checking. | Added explicit string checks, trimming, lowercase normalization, and regex validation (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`) returning `400 Bad Request` if invalid. |
| 2 | `backend/src/routes/auth.routes.ts` (lines 60–67) | **Response Format Inconsistency**: Login response returned `{ success: true, message, user }` while other endpoints used `{ success: true, data }`. | Added standard `data: payload` property alongside `user: payload` to ensure consistency while preserving backwards compatibility. |
| 3 | `backend/src/routes/scrape.routes.ts` (lines 13–25) | **Missing Platform Input Validation**: `POST /api/scrape` silently defaulted to scraping both Tokopedia & Amazon when an invalid platform string (e.g., `"SHOPEE"`) was passed. | Added validation against `['TOKOPEDIA', 'AMAZON', 'ALL']`, returning `400 Bad Request` with an informative error message if an unsupported platform is specified. |
| 4 | `backend/src/routes/scrape.routes.ts` (lines 35–75) | **Response Format Inconsistency**: Scrape response did not include a standard nested `data` object matching other API endpoints. | Added standard `data: { count, platform, details }` object in response. |
| 5 | `backend/src/routes/product.routes.ts` (lines 10–55) | **Missing Query Parameter Validation**: `GET /api/products` did not validate if `minPrice` or `maxPrice` were negative, or if `minPrice > maxPrice`, or if `minRating` was outside `0..5`. | Added strict validation for `minPrice >= 0`, `maxPrice >= 0`, `minPrice <= maxPrice`, `0 <= minRating <= 5`, and positive integer `limit`, returning `400 Bad Request` on invalid query params. |
| 6 | `backend/src/routes/product.routes.ts` (lines 65–85) | **Missing Parameter Validation in Detail Route**: `GET /api/products/:id` did not validate that `id` was a non-empty string before database query. | Added validation returning `400 Bad Request` if `id` is blank or missing. |
| 7 | `backend/src/routes/product.routes.ts` (lines 90–270) | **Missing POST & PUT Endpoints**: Missing standard create and update routes (`POST /api/products` and `PUT /api/products/:id`) with input validation. | Implemented `POST /api/products` (returns `201 Created` with validated fields: `title`, `price >= 0`, `platform`, `url`, `rating 0..5`, `imageUrl`) and `PUT /api/products/:id` with full validation and `404 Not Found` handling. |
| 8 | `backend/src/routes/admin.routes.ts` (lines 46–65) | **Missing Parameter Validation in Delete Route**: `DELETE /api/admin/products/:id` lacked string trimming and validation on `id`. | Added validation returning `400 Bad Request` if `id` is invalid or empty. |
| 9 | `backend/src/routes/admin.routes.ts` (lines 105–118) | **Response Format Inconsistency**: `GET /api/admin/config-status` returned raw `{ groq, brightdata }` instead of standardized `{ success: true, data: { groq, brightdata } }`. | Standardized response to include `success: true` and `data: { groq, brightdata }` while retaining top-level properties for frontend backwards-compatibility. |
| 10 | `backend/src/routes/ai.routes.ts` (lines 48–65) | **Improper HTTP Status Code on Empty Database**: When database contained 0 products, `POST /api/ai/analyze` returned `500 Internal Server Error`. | Updated error handler to return `400 Bad Request` when no products are found in the database, with clear instructions to scrape products first. |
| 11 | `backend/src/index.ts` (lines 16–22) | **CORS Configuration Edge Cases**: Splitting `FRONTEND_URL` on commas did not trim whitespace around origins. | Added `.map(url => url.trim())` and verified origin check handles multiple comma-separated URLs or wildcard fallback safely. |
| 12 | `backend/src/index.ts` (lines 45–62) | **Incomplete Endpoint Catalog**: Welcome endpoint `GET /` did not document `POST /api/products` or `PUT /api/products/:id`. | Added all supported CRUD endpoints to the root catalog list. |
| 13 | `backend/.env.example`, `backend/.env`, root `.env.example` | **Missing Environment Variables**: `NODE_ENV`, `FRONTEND_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD` were missing from example configuration templates. | Updated all `.env.example` templates and `backend/.env` with complete defaults and documentation. |

---

### B. Frontend (`/frontend/src`)

| # | File & Location | Description of Issue | Resolution Implemented |
|---|---|---|---|
| 1 | `frontend/src/pages/AdminDashboard.tsx` (lines 18, 23, 24, 26) | **Unused Imports**: `ShieldCheck`, `Clock`, `Layers`, `XCircle` imported from `lucide-react` but never referenced. | Removed all 4 unused icon imports from file. |
| 2 | `frontend/src/pages/AdminDashboard.tsx` (lines 56–63) | **Missing Cleanup in Lifecycle Hook**: `useEffect` calling `getMe()` lacked an `isMounted` guard or cancellation, risking state updates on unmounted components. | Added `let isMounted = true;` guard and cleanup return function. |
| 3 | `frontend/src/components/Navbar.tsx` (line 2) | **Unused Import**: `Sparkles` imported from `lucide-react` but never used in the component. | Removed unused `Sparkles` import. |
| 4 | `frontend/src/components/ProductGrid.tsx` (line 4) | **Unused Import**: `Sparkles` imported from `lucide-react` but never used in the component. | Removed unused `Sparkles` import. |
| 5 | `frontend/src/pages/LoginPage.tsx` (line 26) | **Silent Empty Catch Block**: Catch block in `checkExistingSession()` was empty with no logging or handling. | Added `console.debug('No active session found:', err);` to prevent silent suppression. |
| 6 | `frontend/vite.config.ts` (line 8) | **Dev Server Port Inconsistency**: Vite server was configured to port 3000, while the project specification and documentation specify port 5173. | Updated server configuration to `port: 5173`. |
| 7 | `frontend/src/types/index.ts` (lines 57–64) | **Type Mismatch in AuthResponse**: `AuthResponse` interface lacked optional `data?: User` field returned by server. | Added `data?: User;` to `AuthResponse` interface. |

---

## 3. Issues Requiring Architectural Design Decisions (Not Automatically Modified)

The following items require higher-level architectural decisions and were intentionally left unchanged per instructions:

1. **Database Engine: SQLite vs. PostgreSQL**
   - *Current State*: The project uses SQLite (`file:./dev.db`) locally and is pre-configured for PostgreSQL in Railway deployment configs (`schema.prisma` datasource is SQLite for local execution).
   - *Recommendation*: For multi-instance production deployments on Railway or containerized cloud platforms, switch Prisma provider to `postgresql` and set `DATABASE_URL` to a hosted PostgreSQL instance. SQLite is optimal for single-node local development.

2. **Scraping Concurrency & Worker Queue**
   - *Current State*: Manual and scheduled scraping runs in-process via `node-cron` and async execution.
   - *Recommendation*: Under high concurrent traffic, scraping requests should be dispatched to a background worker queue (such as BullMQ with Redis) to prevent HTTP connection timeouts and avoid rate limits on upstream targets.

3. **Rate Limiting Middleware**
   - *Current State*: Endpoints have no IP-based request throttling (`express-rate-limit`).
   - *Recommendation*: Install `express-rate-limit` to protect `POST /api/auth/login` from brute-force attempts and `POST /api/scrape` from denial-of-service triggers.

---

## 4. Build & Runtime Test Results

### Build Verification
- **Backend Build (`backend/npm run build`)**:  
  `tsc` executed cleanly with **0 TypeScript errors**.
- **Frontend Build (`frontend/npm run build`)**:  
  `tsc -b && vite build` bundled 2,284 modules cleanly with **0 errors**. Dist assets output to `/frontend/dist`.

### Runtime Verification (curl Endpoints)
The backend and frontend dev servers were started and tested against all required endpoints:

1. `POST /api/auth/login` (`admin@scrapehub.dev` / `Admin123!`):  
   **Result: SUCCESS (HTTP 200 OK)**. Returned user object and set `token` httpOnly cookie with 7-day expiration.
2. `GET /api/products`:  
   **Result: SUCCESS (HTTP 200 OK)**. Retrieved product catalog array with prices, ratings, and timestamps.
3. `GET /api/admin/products` (with authenticated cookie):  
   **Result: SUCCESS (HTTP 200 OK)**. Successfully retrieved admin products table.  
   *(Verified that request without cookie returned **HTTP 401 Unauthorized**)*.
4. `POST /api/scrape`:  
   **Result: SUCCESS (HTTP 200 OK)**. Successfully scraped 60 live items from Tokopedia; Amazon was safely skipped with a clean log entry due to unconfigured Bright Data key.
5. `POST /api/auth/login` (invalid email):  
   **Result: SUCCESS (HTTP 400 Bad Request)**. Validation rejected invalid email format.
6. `POST /api/scrape` (invalid platform parameter):  
   **Result: SUCCESS (HTTP 400 Bad Request)**. Validation rejected unsupported platform `"SHOPEE"`.
7. `POST /api/products` (missing required fields):  
   **Result: SUCCESS (HTTP 400 Bad Request)**. Validation rejected product missing title.
8. `GET /api/admin/config-status`:  
   **Result: SUCCESS (HTTP 200 OK)**. Returned `{ success: true, data: { groq: false, brightdata: false }, groq: false, brightdata: false }`.

All test servers and child processes were terminated cleanly after testing.
