FROM node:20-slim AS builder
# Build-time cache breaker
ARG CACHE_BREAKER=6
RUN apt-get update && apt-get install -y libc6 openssl ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY . .
RUN df -h
RUN npm install -g npm@latest turbo
RUN npm install --legacy-peer-deps
RUN df -h
# Set a dummy URL for build-time Prisma generation
ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/postgres"
ENV PRISMA_CLIENT_ENGINE_TYPE="library"
ENV PRISMA_CLI_QUERY_ENGINE_TYPE="library"
RUN npx prisma generate --schema=packages/database/prisma/schema.prisma
RUN npx turbo run build --filter=@pazaryonetimi/api
RUN npm prune --omit=dev --legacy-peer-deps
RUN df -h

FROM node:20-slim AS runner
RUN apt-get update && apt-get install -y openssl ca-certificates wait-for-it wget gnupg \
    && rm -rf /var/lib/apt/lists/*
RUN df -h
RUN apt-get update && apt-get install -y chromium \
    && rm -rf /var/lib/apt/lists/*
RUN df -h

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

ENV PRISMA_CLIENT_ENGINE_TYPE="library"

# Don't run production as root
RUN groupadd --system --gid 1001 nodejs
RUN useradd --system --uid 1001 nestjs

# Create home directory for nestjs user (critical for Puppeteer/Chromium)
RUN mkdir -p /home/nestjs/.puppeteer_data && chown -R nestjs:nodejs /home/nestjs

USER nestjs

COPY --from=builder --chown=nestjs:nodejs /app/ ./

# DATABASE_URL should be provided at runtime (docker-compose, etc)
# ENV DATABASE_URL=file:/app/packages/database/prisma/dev.db

EXPOSE 3001

CMD ["node", "apps/api/dist/main"]
