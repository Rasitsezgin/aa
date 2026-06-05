FROM node:22-slim AS base
RUN apt-get update && \
    DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends \
    ca-certificates \
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

# Handle special native modules (--ignore-scripts: prisma schema not copied yet)
RUN npm install --no-save napi-postinstall --ignore-scripts && \
    if [ -d node_modules/unrs-resolver ]; then npm rebuild unrs-resolver; fi

# Copy pruned source code
COPY --from=pruner /app/out/full/ .

# Build-time args for Next.js
ARG DATABASE_URL
ARG NEXT_PUBLIC_API_URL
ARG NEXTAUTH_URL
ARG NEXTAUTH_SECRET
ENV DATABASE_URL=$DATABASE_URL

# Generate Prisma client + build database package (dist/generated/client)
RUN npm run db:generate --prefix . && npm run build --workspace=@pazaryonetimi/database

# Build the project
ENV NODE_OPTIONS="--max-old-space-size=3072"
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
# Monorepo: standalone trace may miss workspace Prisma client
COPY --from=builder --chown=nextjs:nodejs /app/packages/database/dist ./packages/database/dist
COPY --from=builder --chown=nextjs:nodejs /app/packages/database/generated ./packages/database/generated
COPY --from=builder --chown=nextjs:nodejs /app/packages/database/package.json ./packages/database/package.json

USER nextjs
EXPOSE 3000
CMD ["node", "apps/web/server.js"]

