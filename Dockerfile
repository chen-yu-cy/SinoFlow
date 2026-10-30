# FILE: Dockerfile
# Stage 1: Install dependencies
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY package.json package-lock.json ./
COPY prisma ./prisma/

# Skip husky prepare script in Docker build
RUN npm pkg delete scripts.prepare && npm ci --legacy-peer-deps

# Stage 2: Build the Next.js application
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate
RUN npm run build

# Stage 3: Production runner with FFmpeg & Prisma
FROM node:20-alpine AS runner
RUN apk add --no-cache ffmpeg openssl

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copy standalone build output and static assets
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma

# Install Prisma CLI for automated schema sync on container startup
RUN npm install -g prisma@5.22.0

# Ensure upload directories exist
RUN mkdir -p /app/public/uploads/videos /app/public/uploads/resources

EXPOSE 3000

CMD ["sh", "-c", "prisma db push --skip-generate && node server.js"]
