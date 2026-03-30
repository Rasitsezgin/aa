FROM node:20-slim AS builder
ARG CACHE_BREAKER=8
RUN apt-get update && apt-get install -y libc6 openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN corepack disable 2>/dev/null || true && rm -f /usr/local/bin/yarn /usr/local/bin/yarnpkg
WORKDIR /app

# Build-time args needed by Next.js static optimization & Prisma
ARG DATABASE_URL="postgresql://build:build@localhost:5432/build"
ARG NEXT_PUBLIC_API_URL
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ENV DATABASE_URL=$DATABASE_URL

COPY . .
RUN npm install -g npm@latest turbo
RUN npm install --legacy-peer-deps
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npx turbo run build --filter=@pazaryonetimi/web

FROM node:20-slim AS runner
RUN apt-get update && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# These MUST be overridden at runtime via docker-compose / Coolify env vars
ENV DATABASE_URL=""
ENV NEXTAUTH_URL=""
ENV NEXTAUTH_SECRET=""
ENV AUTH_URL=""
ENV AUTH_SECRET=""

# Don't run production as root
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nextjs
USER nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public

# Automatically leverage output traces to reduce image size
# https://nextjs.org/docs/advanced-features/output-file-tracing
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

EXPOSE 3000

CMD ["node", "apps/web/server.js"]
