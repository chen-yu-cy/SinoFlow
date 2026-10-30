# SinoFlow - Chinese Language Learning Platform

An online Chinese language learning platform built with Next.js 15, TypeScript, and Prisma.

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Database Setup
Ensure you have a PostgreSQL instance running and update the `DATABASE_URL` in `.env`.
Then, sync the schema and generate the Prisma client:
```bash
npx prisma db push
```

### 3. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the result.

## Current Progress
- [x] Project structure initialization (Next.js 15, TS, Vanilla CSS)
- [x] Prisma schema and client setup
- [x] Homepage with mock course list
- [x] Course Detail page with HLS Video Player support
- [ ] Payment integration (WeChat/Alipay)
- [ ] Real data fetching & Authentication
