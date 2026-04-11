FROM node:20-slim AS base
RUN apt-get update && apt-get install -y libc6 openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN npm install -g turbo

FROM base AS pruner
WORKDIR /app
COPY . .
RUN npx turbo prune --scope=@pazaryonetimi/api --docker

FROM base AS builder
WORKDIR /app
# Install build tools for native modules compilation
RUN apt-get update && apt-get install -y build-essential python3 pkg-config libpixman-1-dev libcairo2-dev libpango1.0-dev libjpeg-dev libgif-dev libpng-dev librsvg2-dev && rm -rf /var/lib/apt/lists/*

# Copy pruned package files
COPY --from=pruner /app/out/json/ .
# Copy lockfile
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
# Install dependencies (skip postinstall scripts to avoid napi-postinstall errors)
RUN npm install --legacy-peer-deps --ignore-scripts
# Ensure napi-postinstall binary exists, then rebuild only required module
RUN npm install --no-save napi-postinstall && \
    if [ -d node_modules/unrs-resolver ]; then npm rebuild unrs-resolver; fi

# Copy pruned source code
COPY --from=pruner /app/out/full/ .
# Generate Prisma Client
RUN if [ ! -d node_modules/graphmatch ] || [ ! -d node_modules/zeptomatch ]; then npm install --no-save graphmatch zeptomatch; fi
RUN cd packages/database && npx prisma generate

# Build the project (128MB less for ARM)
ENV NODE_OPTIONS="--max-old-space-size=3968"
RUN npx turbo run build --filter=@pazaryonetimi/api

FROM node:20-slim AS runner
RUN apt-get update && apt-get install -y openssl ca-certificates \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PRISMA_CLIENT_ENGINE_TYPE="library"
ENV NODE_ENV=production

WORKDIR /app

# Create unprivileged user
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 nestjs
RUN mkdir -p /home/nestjs/.puppeteer_data && chown -R nestjs:nodejs /home/nestjs

# 1. Copy pruned metadata and lockfile
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

# 2. Production install - with root dependencies now including NestJS core
RUN npm install --omit=dev --legacy-peer-deps

# 2.5 Copy Prisma Client from builder
# Copy both the Prisma runtime package AND the generated client
COPY --from=builder /app/node_modules/@prisma/client /app/node_modules/@prisma/client
COPY --from=builder /app/node_modules/.prisma /app/node_modules/.prisma

# 3. Copy built artifacts
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/packages ./packages

# Fix permissions
RUN chown -R nestjs:nodejs /app

USER nestjs

# Set NODE_PATH to ensure global hoisting works regardless of script location
ENV NODE_PATH=/app/node_modules

EXPOSE 3001

# Start the main application
CMD ["node", "apps/api/dist/main.js"]
