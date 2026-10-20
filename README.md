# ScrapeHub 🚀

> Intelligent multi-platform e-commerce aggregator, scraper, and market intelligence platform for Tokopedia and Amazon, powered by AI trend analytics and interactive data visualizations.

---

## 📸 Preview

# Front End
<img width="1902" height="917" alt="Screenshot from 2026-10-20 11-06-20" src="https://github.com/user-attachments/assets/95c76309-cd1d-4a5e-a261-3ed6083606d5" />

# Dashboard 
<img width="1904" height="924" alt="Screenshot from 2026-10-20 11-06-52" src="https://github.com/user-attachments/assets/20861373-eb1a-4b1c-8094-1379b876f1a1" />

---

## ✨ Features

- **Multi-Platform Web Scraping**:
  - **Tokopedia Scraper**: Direct GraphQL integration via `@bintangtimurlangit/tokopedia-mcp` with seamless fallback to public GraphQL search without requiring user login.
  - **Amazon Scraper**: High-reliability scraping powered by the Bright Data Dataset API (`gd_l7q7dkf244hwjntr0`). Safely skips with descriptive logging if credentials are not configured.
  - **Scheduled Cron Jobs**: Automated background cron worker runs every 6 hours (`0 */6 * * *`) via `node-cron` to keep product catalogs up to date.
  - **On-Demand Manual Scraping**: Instantly trigger scrapes from either the public UI or via REST API with per-platform targeting (`TOKOPEDIA`, `AMAZON`, or `ALL`).
- **Interactive Product Catalog & Filtering**:
  - Filter products in real time by platform (Tokopedia, Amazon, or All), price boundaries (minimum and maximum in IDR), and star rating thresholds.
- **AI Trend Analysis**:
  - Automated sentiment, category movement, and price range evaluation powered by Groq Cloud AI using `llama-3.3-70b-versatile`.
  - Price tier distribution bar charts rendered dynamically with Recharts.
- **Protected Admin Dashboard**:
  - Secure administration panel with httpOnly JWT cookie authentication.
  - Paginated product catalog management with single-click deletions.
  - Real-time scrape activity logs tracking timestamp, item count, execution status, and diagnostic messages.
  - Live API key configuration indicators for Groq and Bright Data credentials.

---

## 🛠️ Tech Stack

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (v18+ or v20+)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (ESM module format)
- **Framework**: [Express.js](https://expressjs.com/)
- **ORM & Database**: [Prisma ORM](https://www.prisma.io/) with SQLite (local development) / PostgreSQL (production)
- **Authentication**: JWT (`jsonwebtoken`) stored in secure, `httpOnly` cookies with `bcryptjs` password hashing
- **AI Engine**: [Groq SDK](https://github.com/groq/groq-typescript) (`llama-3.3-70b-versatile`)
- **HTTP & Utilities**: [Axios](https://axios-http.com/), `cookie-parser`, `cors`, `dotenv`, `node-cron`

### Frontend
- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Routing**: [React Router](https://reactrouter.com/) (v7) with protected route guards
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) (modern slate dark theme)
- **Charts & Visualization**: [Recharts](https://recharts.org/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📋 Prerequisites

Before installing ScrapeHub, ensure your development system has:
- **Node.js**: v18.18.0 or v20.x or higher
- **npm**: v9.x or v10.x or higher (or `pnpm` / `yarn`)
- **Git**

---

## 📁 Folder Structure

```text
scrapehub/
├── backend/                        # Backend REST API
│   ├── src/
│   │   ├── index.ts                # Express server entry point & middleware setup
│   │   ├── prisma.ts               # PrismaClient shared singleton instance
│   │   ├── middlewares/
│   │   │   └── auth.middleware.ts  # JWT verification & requireAdmin route guards
│   │   ├── routes/
│   │   │   ├── admin.routes.ts     # Protected administrative endpoints
│   │   │   ├── ai.routes.ts        # AI trend analysis & summary endpoints
│   │   │   ├── auth.routes.ts      # Authentication endpoints (login, logout, me)
│   │   │   ├── product.routes.ts   # Product catalog CRUD & query endpoints
│   │   │   └── scrape.routes.ts    # Manual scraper trigger endpoints
│   │   ├── services/
│   │   │   ├── ai.service.ts       # Groq Cloud AI analysis service
│   │   │   ├── scheduler.ts        # node-cron 6-hour background scraping worker
│   │   │   └── scraper/
│   │   │       ├── amazon.ts       # Bright Data Amazon scraper integration
│   │   │       └── tokopedia.ts    # Tokopedia GraphQL scraper engine
│   │   └── prisma/
│   │       ├── schema.prisma       # Database schema models
│   │       └── seed.ts             # Default administrator database seeder
│   ├── .env.example                # Backend environment variable template
│   ├── package.json
│   ├── Procfile                    # Railway process command
│   ├── railway.json                # Railway Nixpacks deployment config
│   └── tsconfig.json
├── frontend/                       # Frontend Single Page Application (SPA)
│   ├── src/
│   │   ├── components/             # Reusable UI components
│   │   │   ├── FilterBar.tsx       # Platform, price, and rating filter controls
│   │   │   ├── Navbar.tsx          # Main header navigation bar & live system badges
│   │   │   ├── ProductCard.tsx     # Product display card with pricing & links
│   │   │   ├── ProductGrid.tsx     # Responsive grid container & loading skeletons
│   │   │   ├── ProtectedRoute.tsx  # Route authentication verification wrapper
│   │   │   ├── StatCard.tsx        # KPI metrics counter card
│   │   │   └── TrendSummary.tsx    # Groq AI trend summary & Recharts price distribution
│   │   ├── pages/
│   │   │   ├── AdminDashboard.tsx  # Full admin portal (tables, logs, API keys)
│   │   │   ├── LoginPage.tsx       # Admin authentication login screen
│   │   │   └── PublicDashboard.tsx # Public product catalog & analytics dashboard
│   │   ├── services/
│   │   │   └── api.ts              # Centralized Axios API client
│   │   ├── types/
│   │   │   └── index.ts            # Shared TypeScript interface definitions
│   │   ├── App.tsx                 # Route declarations & top-level layout
│   │   ├── index.css               # Tailwind CSS entry point
│   │   └── main.tsx                # React DOM mount point
│   ├── .env.example                # Frontend environment variable template
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   ├── vercel.json                 # Vercel SPA client rewrite configuration
│   └── vite.config.ts              # Vite server & bundler configuration
├── .env.example                    # Global environment variables template
├── .gitignore                      # Git exclusion rules
├── BUGFIX_REPORT.md                # Comprehensive audit and bugfix report
└── README.md                       # Main project documentation (this file)
```

---

## 🚀 Installation & Setup

Follow these step-by-step instructions to get ScrapeHub running locally:

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/scrapehub.git
cd scrapehub
```

### 2. Configure Backend
```bash
cd backend
npm install
cp .env.example .env
```

Open `backend/.env` and configure your settings:
```env
DATABASE_URL="file:./dev.db"
PORT=5001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
JWT_SECRET="scrapehub-admin-secret-jwt-key-2026-very-secure!"
ADMIN_EMAIL="admin@scrapehub.dev"
ADMIN_PASSWORD="Admin123!"
GROQ_API_KEY=""                        # Optional: Add your Groq API key (gsk_...)
BRIGHTDATA_API_KEY=""                  # Optional: Add your Bright Data API key
BRIGHTDATA_AMAZON_DATASET_ID="gd_l7q7dkf244hwjntr0"
```

Initialize the database and seed the default administrator user:
```bash
npx prisma migrate dev --name init # or: npm run prisma:push
npx prisma db seed                 # or: npm run seed
```

### 3. Configure Frontend
Open a new terminal and navigate to the frontend directory:
```bash
cd ../frontend
npm install
cp .env.example .env
```

Ensure `frontend/.env` points to the local backend server:
```env
VITE_API_URL="http://localhost:5001"
```

---

## 💻 Running Locally

### Start Backend Server
```bash
cd backend
npm run dev
```
The backend API server starts at: **`http://localhost:5001`**

### Start Frontend Server
```bash
cd frontend
npm run dev
```
The frontend application starts at: **`http://localhost:5173`**

Open your browser and navigate to `http://localhost:5173` to explore the dashboard.

---

## 🔐 Default Admin Account

A default administrator account is generated during database seeding:

- **Email**: `admin@scrapehub.dev`
- **Password**: `Admin123!`
- **Login Portal**: `http://localhost:5173/login`
- **Admin Dashboard**: `http://localhost:5173/admin`

> ⚠️ **IMPORTANT SECURITY NOTICE**: The default credentials above must be changed prior to deploying ScrapeHub to a public production environment. Set a strong, unique `ADMIN_PASSWORD` and `JWT_SECRET` in your production environment variables.

---

## ⚙️ Environment Variables

### Backend Variables (`backend/.env`)

| Variable | Type | Default Value | Description |
|---|---|---|---|
| `DATABASE_URL` | String | `"file:./dev.db"` | Prisma connection string (SQLite file path or PostgreSQL URI). |
| `PORT` | Number | `5001` | Port on which the Express server listens. |
| `NODE_ENV` | String | `"development"` | Application environment (`development` or `production`). |
| `FRONTEND_URL` | String | `"http://localhost:5173"` | Allowed CORS origins (supports comma-separated origins). |
| `JWT_SECRET` | String | *(random secret)* | Secret cryptographic key used to sign and verify authentication JWTs. |
| `ADMIN_EMAIL` | String | `"admin@scrapehub.dev"` | Default admin account email used during database seeding. |
| `ADMIN_PASSWORD` | String | `"Admin123!"` | Default admin account password hashed with bcrypt during seeding. |
| `GROQ_API_KEY` | String | `""` | Groq Cloud API key for Llama 3.3 AI trend analysis (optional). |
| `BRIGHTDATA_API_KEY` | String | `""` | Bright Data API token for Amazon scraping (optional). |
| `BRIGHTDATA_AMAZON_DATASET_ID` | String | `"gd_l7q7dkf244hwjntr0"` | Target Amazon scraping dataset identifier on Bright Data. |

### Frontend Variables (`frontend/.env`)

| Variable | Type | Default Value | Description |
|---|---|---|---|
| `VITE_API_URL` | String | `"http://localhost:5001"` | Target backend API base URL called by Axios client. |

---

## 📡 API Endpoints Reference

### Authentication Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | Authenticates admin credentials and sets httpOnly JWT cookie. |
| `POST` | `/api/auth/logout` | Public | Clears authentication cookie. |
| `GET` | `/api/auth/me` | Authenticated | Retrieves current authenticated session user profile. |

### Product Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | Fetches filtered products (`platform`, `minPrice`, `maxPrice`, `minRating`, `limit`). |
| `GET` | `/api/products/:id` | Public | Retrieves detailed information for a single product. |
| `POST` | `/api/products` | Public / Admin | Manually creates a product item with input validation. |
| `PUT` | `/api/products/:id` | Public / Admin | Updates an existing product item by ID with input validation. |

### Scraper Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/scrape` | Public / Admin | Triggers scraping job. Accepts optional `{ platform: "TOKOPEDIA" \| "AMAZON" \| "ALL" }`. |

### AI Trend Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/trends/latest` | Public | Retrieves the latest stored AI trend analysis record. |
| `POST` | `/api/ai/analyze` | Public | Analyzes top 10 products with Groq AI (`llama-3.3-70b-versatile`) and stores summary. |

### Admin Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/products` | Admin Only | Fetches products for admin management table. |
| `DELETE` | `/api/admin/products/:id` | Admin Only | Deletes a product from the database by ID. |
| `GET` | `/api/admin/logs` | Admin Only | Returns recent 50 scraping execution logs and error messages. |
| `GET` | `/api/admin/config-status` | Admin Only | Returns status indicators for `groq` and `brightdata` API keys. |

### System Endpoints
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Server uptime and health verification endpoint. |
| `GET` | `/` | Public | Welcome payload and API endpoint catalog. |

---

## 🚀 Deployment Guide

To achieve optimal performance and prevent serverless timeouts during long-running scraping tasks, ScrapeHub is architected for split deployment:
- **Backend on Railway**: Supports continuous background execution, node-cron schedulers, and managed PostgreSQL.
- **Frontend on Vercel**: High-speed edge CDN distribution for the React Single Page Application.

### 1. Deploy Backend to Railway

1. Sign in to [Railway.app](https://railway.app/) and create a **New Project**.
2. Add a **PostgreSQL** database (*New -> Database -> Add PostgreSQL*).
3. Connect your repository and select the **Root Directory** as `backend`.
4. Railway will automatically detect `railway.json` and `Procfile`.
5. Under the **Variables** tab of the backend service, set:
   - `DATABASE_URL`: Reference your PostgreSQL instance: `${{Postgres.DATABASE_URL}}`
   - `NODE_ENV`: `production`
   - `PORT`: (Managed automatically by Railway)
   - `JWT_SECRET`: Generate a secure 32+ character random string.
   - `ADMIN_EMAIL`: Your production admin email.
   - `ADMIN_PASSWORD`: Your secure production admin password.
   - `GROQ_API_KEY`: Your Groq Cloud API key.
   - `BRIGHTDATA_API_KEY`: Your Bright Data API key (optional).
   - `FRONTEND_URL`: Your Vercel frontend URL (e.g., `https://your-app.vercel.app`).
6. Navigate to **Settings -> Networking -> Generate Domain** to obtain your public backend domain (e.g., `https://scrapehub-backend-production.up.railway.app`).

### 2. Deploy Frontend to Vercel

1. Sign in to [Vercel.com](https://vercel.com/) and click **Add New... -> Project**.
2. Select your repository.
3. Configure the build parameters:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, define:
   - `VITE_API_URL`: Your Railway backend domain (e.g., `https://scrapehub-backend-production.up.railway.app`, without trailing slash).
5. The bundled `frontend/vercel.json` ensures all client-side routes (`/login`, `/admin`) are redirected seamlessly to `index.html`.
6. Click **Deploy**.

---

## 🔒 Security Best Practices

1. **HttpOnly Cookie Authentication**:
   - Authentication tokens are delivered via `httpOnly`, `SameSite=Lax` cookies, preventing cross-site scripting (XSS) token exfiltration.
2. **Never Commit Secrets**:
   - `.env` files are strictly excluded via `.gitignore`. Always use `.env.example` templates for configuration reference.
3. **Password Security**:
   - All user passwords are encrypted using `bcryptjs` with salt rounds set to 10.
4. **Rate Limiting**:
   - For high-exposure production environments, configure reverse-proxy rate limiting (e.g., Cloudflare) or add `express-rate-limit` to protect `/api/auth/login` and `/api/scrape`.

---

## ❓ Troubleshooting & FAQs

### 1. Amazon scraping is skipped with a warning log
- **Cause**: `BRIGHTDATA_API_KEY` is empty or unset in `backend/.env`.
- **Solution**: Amazon scraping requires Bright Data unlocker proxies. Add your key to `BRIGHTDATA_API_KEY` in `backend/.env`. If omitted, ScrapeHub gracefully skips Amazon and continues scraping Tokopedia without crashing.

### 2. `POST /api/ai/analyze` returns HTTP 503
- **Cause**: `GROQ_API_KEY` is not configured in `backend/.env`.
- **Solution**: Obtain a free API key at [console.groq.com](https://console.groq.com/) and set `GROQ_API_KEY="gsk_..."` in `backend/.env`, then restart the backend server.

### 3. CORS Error ("Cross-Origin Request Blocked")
- **Cause**: The backend's `FRONTEND_URL` does not match the origin URL sending requests.
- **Solution**: In `backend/.env`, set `FRONTEND_URL="http://localhost:5173"`. If supporting multiple origins (e.g., local and staging), separate them with commas: `FRONTEND_URL="http://localhost:5173,https://your-app.vercel.app"`.

### 4. Database schema out of sync or `Table not found`
- **Cause**: Prisma schema changes have not been applied to the local database file.
- **Solution**: Run `npm run prisma:push` inside the `backend` directory, followed by `npm run seed` to ensure tables and admin accounts are present.

### 5. `Error: listen EADDRINUSE: address already in use :::5001`
- **Cause**: Another background process is occupying port 5001 or 5173.
- **Solution**: Identify and terminate the occupying process:
  ```bash
  lsof -ti:5001 | xargs kill -9
  lsof -ti:5173 | xargs kill -9
  ```

### 6. Admin login session does not persist across reloads
- **Cause**: Browser cookie blocked due to cross-site domain restrictions or insecure protocol in production.
- **Solution**: In production, ensure both backend and frontend use HTTPS. In development, verify `withCredentials: true` is enabled on the Axios client and the cookie domain matches.

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

Test Pull Shark 1
