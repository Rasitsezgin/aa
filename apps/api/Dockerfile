FROM node:20-slim AS base
RUN apt-get update && apt-get install -y libc6 openssl ca-certificates && rm -rf /var/lib/apt/lists/*
RUN npm install -g pnpm turbo

FROM base AS pruner
WORKDIR /app
COPY . .
RUN npx turbo prune --scope=@pazaryonetimi/api --docker

FROM base AS builder
WORKDIR /app
# Copy pruned package files
COPY --from=pruner /app/out/json/ .
# Copy lockfile
COPY --from=pruner /app/out/package-lock.json ./package-lock.json
# Install dependencies
RUN npm install --legacy-peer-deps

# Copy pruned source code
COPY --from=pruner /app/out/full/ .
# Build the project
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npx turbo run build --filter=@pazaryonetimi/api

FROM node:20-slim AS runner
RUN apt-get update && apt-get install -y openssl ca-certificates wait-for-it wget gnupg chromium \
    && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV PRISMA_CLIENT_ENGINE_TYPE="library"
ENV NODE_ENV=production

WORKDIR /app

# Create unprivileged user
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 nestjs
RUN mkdir -p /home/nestjs/.puppeteer_data && chown -R nestjs:nodejs /home/nestjs

# Copy only necessary files from builder
COPY --from=builder /app/package.json .
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./apps/api/dist
COPY --from=builder /app/apps/api/package.json ./apps/api/package.json
COPY --from=builder /app/packages ./packages

# Fix permissions
RUN chown -R nestjs:nodejs /app

USER nestjs
EXPOSE 3001
CMD ["node", "apps/api/dist/main"]
