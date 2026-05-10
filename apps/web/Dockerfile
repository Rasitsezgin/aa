FROM node:22-slim AS base
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    ca-certificates \
    build-essential \
    python3 \
    pkg-config \
    libpixman-1-dev \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    libpng-dev \
    librsvg2-dev \
    libpixman-1-0 \
    libcairo2 \
    libpango-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    libpng16-16 \
    librsvg2-2 \
    && rm -rf /var/lib/apt/lists/*
RUN npm install -g turbo

FROM base AS pruner
WORKDIR /app
COPY . .
RUN npx turbo prune --scope=@pazaryonetimi/web --docker

FROM base AS builder
WORKDIR /app
# Base already contains build tools

# Copy pruned package files
COPY --from=pruner /app/out/json/ .
COPY --from=pruner /app/out/package-lock.json ./package-lock.json

# Install dependencies
RUN npm install --legacy-peer-deps --ignore-scripts

# Handle special native modules
RUN npm install --no-save napi-postinstall && \
    if [ -d node_modules/unrs-resolver ]; then npm rebuild unrs-resolver; fi && \
    if [ -d node_modules/canvas ]; then npm rebuild canvas; fi

# Copy pruned source code
COPY --from=pruner /app/out/full/ .

# Build-time args for Next.js
ARG DATABASE_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ENV DATABASE_URL=$DATABASE_URL

# Generate Prisma Client
RUN cd packages/database && npx prisma generate

# Build the project
ENV NODE_OPTIONS="--max-old-space-size=4096"
RUN npx turbo run build --filter=@pazaryonetimi/web

# Prune dev dependencies
RUN npm prune --production --legacy-peer-deps

FROM base AS runner
# Base already contains runtime libraries

WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV NODE_OPTIONS="--max-old-space-size=3072"

# Create unprivileged user
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 nextjs

COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]

