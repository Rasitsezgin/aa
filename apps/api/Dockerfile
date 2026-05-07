FROM node:22-slim AS base
RUN apt-get update && apt-get install -y \
    libc6 \
    openssl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*
RUN npm install -g turbo

FROM base AS pruner
WORKDIR /app
COPY . .
RUN npx turbo prune --scope=@pazaryonetimi/api --docker

FROM base AS builder
WORKDIR /app
# Install minimal build tools for native modules (mostly for napi-postinstall/unrs-resolver)
RUN apt-get update && apt-get install -y \
    build-essential \
    python3 \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

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

# Generate Prisma Client
RUN cd packages/database && npx prisma generate

# Build the project
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npx turbo run build --filter=@pazaryonetimi/api

FROM node:22-slim AS runner
RUN apt-get update && apt-get install -y \
    openssl \
    ca-certificates \
    # Chromium dependencies for Puppeteer
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

# Copy Prisma Client from builder
COPY --from=builder /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Copy built artifacts
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages ./packages

# Fix permissions
RUN chown -R nestjs:nodejs /app

USER nestjs
ENV NODE_PATH=/app/node_modules
EXPOSE 3001

# Start the application with an automatic database sync
CMD ["sh", "-c", "cd packages/database && npx prisma db push --skip-generate && cd ../.. && node apps/api/dist/main.js"]


