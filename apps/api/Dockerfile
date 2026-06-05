FROM node:22-slim AS base
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    ca-certificates \
    libnss3 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdrm2 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libgbm1 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*
RUN npm install -g turbo

FROM base AS pruner
WORKDIR /app
COPY . .
RUN npx turbo prune --scope=@pazaryonetimi/api --docker

FROM base AS builder
WORKDIR /app
# Base already contains build tools

# Copy pruned package files
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

# Install all dependencies (including dev for building)
RUN npm install --legacy-peer-deps --ignore-scripts

# Handle special native modules if they exist
RUN npm install --no-save napi-postinstall && \
    if [ -d node_modules/unrs-resolver ]; then npm rebuild unrs-resolver; fi

# Copy pruned source code
COPY --from=pruner /app/out/full/ .

# Prisma client + database package build (dist/generated/client)
RUN npm run db:generate && npm run build --workspace=@pazaryonetimi/database

# Build the project
ENV NODE_OPTIONS="--max-old-space-size=3072"
RUN npx turbo run build --filter=@pazaryonetimi/api

FROM base AS runner
# Base already contains runtime libraries

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PRISMA_CLIENT_ENGINE_TYPE="library"
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=3072"

WORKDIR /app

# Create unprivileged user
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 nestjs
RUN mkdir -p /home/nestjs/.puppeteer_data && chown -R nestjs:nodejs /home/nestjs

# Copy pruned metadata and lockfile
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

# Install production dependencies
RUN npm install --omit=dev --legacy-peer-deps

# Prisma CLI + runtime deps
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/.bin/prisma ./node_modules/.bin/prisma

# Copy built artifacts (includes packages/database/dist + generated/client)
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages/database ./packages/database

# Fix permissions
RUN chown -R nestjs:nodejs /app

USER nestjs
ENV NODE_PATH=/app/node_modules
EXPOSE 3001

# Start the application with an automatic database sync and seeding
CMD ["sh", "-c", "cd packages/database && ../../node_modules/.bin/prisma db push --accept-data-loss && npm run db:seed && cd ../.. && node apps/api/dist/main.js"]


