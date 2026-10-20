# AGENTS.md — ScrapeHub Rules (GitHub Copilot)

## Mode
Autonomous. Jangan tanya untuk hal teknis rutin. Langsung kerjakan dan test.

## Stack
- Backend: Node.js + TypeScript (ESM) + Express + Prisma + SQLite
- Frontend: React 18 + Vite + TypeScript + Tailwind + Recharts
- AI: Groq SDK (llama-3.3-70b-versatile)
- Scraper: Tokopedia GraphQL, Amazon via Bright Data
- Auth: JWT httpOnly cookie + bcryptjs

## Perintah Wajib
- Backend dev: cd backend && npm run dev
- Frontend dev: cd frontend && npm run dev
- Prisma push: cd backend && npx prisma db push
- Seed admin: cd backend && npx prisma db seed
- Build frontend: cd frontend && npm run build
- Health check: curl http://localhost:5001/api/health

## Struktur
- backend/src/routes/ — endpoint Express
- backend/src/services/scraper/ — Tokopedia & Amazon scraper
- backend/src/services/ai.service.ts — Groq AI
- backend/src/services/scheduler.ts — cron 6 jam
- frontend/src/pages/ — PublicDashboard, AdminDashboard, LoginPage
- frontend/src/components/ — komponen reusable

## Aturan
- Jangan commit backend/.env atau frontend/.env.
- Jangan ubah backend/prisma/schema.prisma tanpa jalankan prisma migrate.
- Ikuti style TypeScript ESM yang sudah ada.
- Setiap endpoint baru → update tabel API di README.md.
- Setiap komponen React baru → taruh di frontend/src/components/.
- Jangan hapus logika fallback Tokopedia (GraphQL → public search).
- Amazon scraper harus tetap graceful skip kalau BRIGHTDATA_API_KEY kosong.
- Jangan hardcode API key. Selalu lewat env.
- Kalau ubah auth, pastikan cookie tetap httpOnly + SameSite=Lax.

## Testing
- Backend: curl http://localhost:5001/api/health → harus 200
- Frontend: buka http://localhost:5173, cek console browser
- AI: POST /api/ai/analyze butuh GROQ_API_KEY valid, kalau kosong return 503
- Scraper: POST /api/scrape dengan body {"platform":"TOKOPEDIA"} → cek log

## Bahasa
Kode & komentar: Inggris. Penjelasan ke saya: Indonesia.
