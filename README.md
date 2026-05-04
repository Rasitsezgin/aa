# Pazaryonetimi.com

**AI-Native Multi-Marketplace E-Commerce Management Platform**

[![CI](https://github.com/erogluerdem/pazaryonetimi/actions/workflows/ci.yml/badge.svg)](https://github.com/erogluerdem/pazaryonetimi/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A comprehensive, AI-powered e-commerce management platform for Turkish and global marketplaces. Built with NestJS, Next.js, and modern web technologies.

## 🚀 Features

- **Multi-Marketplace Integration**: Trendyol, Hepsiburada, Amazon, N11, ÇiçekSepeti, and more
- **AI-Powered Pricing**: Dynamic price optimization based on competitor analysis
- **Inventory Management**: Multi-warehouse stock tracking and synchronization
- **Order Management**: Automated order processing and status updates
- **Customer Segmentation**: RFM analysis and lifetime value calculation
- **Affiliate System**: Referral program with commission tracking
- **AI Content Optimization**: Product description and SEO optimization
- **Reporting**: Scheduled reports with PDF/Excel export
- **Chrome Extension**: In-browser product analysis and competitor tracking
- **Web Scraping**: Automated competitor store and product data extraction

## 🏗 Architecture

This is a **Turborepo** monorepo with the following structure:

```
pazaryonetimi.com/
├── apps/
│   ├── api/           # NestJS Backend API (Port 3001)
│   ├── web/           # Next.js Frontend (Port 3000)
│   └── extension/     # Chrome Extension (Vite + React)
├── packages/
│   └── database/      # Prisma ORM & Database Schema
├── docker-compose.yaml
└── turbo.json
```

### Tech Stack

**Backend (API)**
- NestJS 11.x with TypeScript
- Prisma ORM with PostgreSQL
- BullMQ for job queues (Redis)
- Puppeteer for web scraping
- OpenAI & Google Generative AI integration
- JWT Authentication with 2FA support
- Swagger/OpenAPI documentation

**Frontend (Web)**
- Next.js 15.x with App Router
- React 19.x
- Tailwind CSS 4.x
- TanStack Query for data fetching
- Zustand for state management
- Recharts for data visualization
- Fabric.js for image editing

**Extension**
- Vite build tool
- Chrome Manifest V3
- Content scripts for marketplace integration
- Background service worker

**Infrastructure**
- Docker & Docker Compose
- GitHub Actions CI/CD
- Coolify deployment ready
- Prometheus metrics

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- PostgreSQL 16
- Redis 7
- npm 10+

### Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/erogluerdem/pazaryonetimi.git
cd pazaryonetimi
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Generate Prisma client:
```bash
npm run generate
```

5. Start development servers:
```bash
npm run dev
```

This will start:
- API: http://localhost:3001
- Web: http://localhost:3000
- Swagger Docs: http://localhost:3001/api-docs

### Docker Development

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f api
docker-compose logs -f web
```

## 📁 Project Structure

### API Modules (50+)

| Module | Description |
|--------|-------------|
| `auth` | JWT authentication with 2FA |
| `marketplace` | Multi-platform integration bridges |
| `products` | Product catalog management |
| `orders` | Order processing and tracking |
| `inventory` | Stock management |
| `warehouse` | Multi-warehouse operations |
| `pricing-optimization` | AI-powered dynamic pricing |
| `customer-segmentation` | RFM analysis |
| `market-intelligence` | Competitor analysis |
| `scraping` | Web scraping service |
| `ai` | AI content generation |
| `scheduler` | Job queue management |
| `reports` | Report generation |
| `shipping` | Logistics integration |
| `payments` | Payment processing (iyzico) |
| `e-invoice` | E-fatura integration |
| `webhooks` | Webhook management |
| `affiliate` | Referral program |
| `whatsapp` | WhatsApp Business API |

### Key Files

```
apps/api/src/
├── main.ts              # API entry point
├── worker.ts            # Background job processor
├── app.module.ts        # Root module
├── modules/             # Feature modules
└── common/              # Guards, interceptors, filters

apps/web/src/
├── app/                 # Next.js App Router
│   ├── (landing)/      # Marketing pages
│   ├── dashboard/      # App dashboard
│   └── api/            # API routes
├── components/          # React components
├── hooks/              # Custom hooks
└── lib/                # Utilities
```

## 🧪 Testing

### API Tests
```bash
# Unit tests
cd apps/api
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

### Web Tests
```bash
cd apps/web
npm test
```

## 📦 Deployment

### Coolify Deployment
1. Connect your GitHub repository to Coolify
2. Set required environment variables (see `COOLIFY_ENV_CHECKLIST.md`)
3. Deploy automatically on push to main

### Manual Docker Deployment
```bash
# Build images
docker-compose -f docker-compose.prod.yaml build

# Deploy
docker-compose -f docker-compose.prod.yaml up -d
```

### Environment Variables

**API Required:**
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT signing
- `ENCRYPTION_KEY` - Key for credential encryption

**Web Required:**
- `NEXTAUTH_URL` - Application URL
- `NEXTAUTH_SECRET` - NextAuth secret
- `NEXT_PUBLIC_API_URL` - API base URL

See `.env.example` for full list.

## 🔧 Development Guidelines

### Adding a New API Module
1. Create module folder: `apps/api/src/modules/my-module/`
2. Generate NestJS module: `nest g module my-module`
3. Create service and controller
4. Add to `AppModule` imports
5. Write unit tests: `my-module.service.spec.ts`
6. Update Swagger tags in `main.ts`

### Database Schema Changes
1. Edit `packages/database/prisma/schema.prisma`
2. Generate migration: `npx prisma migrate dev --name description`
3. Update Prisma client: `npm run generate`
4. Apply to database: `npm run db:deploy`

## 📚 API Documentation

API documentation is automatically generated with Swagger:

- Local: http://localhost:3001/api-docs
- Production: https://api.pazaryonetimi.com/api-docs

### Authentication

API uses Bearer token authentication:
```
Authorization: Bearer <your-jwt-token>
```

### Rate Limiting

- 100 requests per minute per IP
- Tenant-specific limits for authenticated endpoints

## � Deployment

### Coolify Deployment

This project is optimized for [Coolify](https://coolify.io) deployment.

#### 1. Prerequisites

- A server with Docker support (Ubuntu 20.04+ recommended)
- 16GB+ RAM recommended
- Coolify installed on your server
- GitHub repository connected

#### 2. Environment Variables

Copy `.env.coolify.example` to `.env.coolify` and configure:

```bash
cp .env.coolify.example .env.coolify
# Edit with your values
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `POSTGRES_PASSWORD` - Database password
- `REDIS_PASSWORD` - Redis password
- `NEXTAUTH_SECRET` - NextAuth.js secret (random 32+ chars)
- `JWT_SECRET` - JWT signing secret
- `NEXT_PUBLIC_API_URL` - Your API URL

#### 3. Coolify Setup

1. **Add Resource** → **Docker Compose**
2. **Repository**: `https://github.com/erogluerdem/pazaryonetimi`
3. **Branch**: `main`
4. **Docker Compose File**: `docker-compose.yaml`
5. Load environment variables from `.env.coolify`

#### 4. Services

| Service | Port | Description |
|---------|------|-------------|
| Web | 3000 | Next.js Frontend |
| API | 3001 | NestJS Backend |
| Worker | - | Background job processor |
| Postgres | 5432 | PostgreSQL database |
| Redis | 6379 | Redis cache & queues |

#### 5. Automatic Deployments

GitHub Actions automatically builds and pushes Docker images on every push to `main`. Coolify webhook triggers deployment.

Required GitHub Secrets:
- `COOLIFY_WEBHOOK_URL` - From Coolify resource settings
- `COOLIFY_API_TOKEN` - From Coolify settings

#### 6. Server Maintenance

The project includes automatic cleanup:
- **Daily at 03:00** - Full system cleanup
- **Every 6 hours** - Light cache cleanup
- **Weekly (Sunday)** - Docker image cleanup

Manual cleanup via Admin API:
```bash
POST /api/admin/cleanup
Body: { "mode": "light" | "full" | "docker" }
```

## �🛠 Troubleshooting

### Common Issues

**Prisma Client Generation Fails**
```bash
cd packages/database
npx prisma generate
```

**Worker Not Processing Jobs**
- Check Redis connection
- Verify `ENABLE_SCHEDULER=true` is set
- Check worker logs: `docker-compose logs worker`

**Puppeteer Scraping Issues**
- Ensure Chromium is installed
- Check `PUPPETEER_EXECUTABLE_PATH` env var
- For Docker: Chromium included in API image

## 🤝 Contributing

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Commit Convention
- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `test:` Adding tests
- `refactor:` Code refactoring
- `chore:` Maintenance tasks

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Erdem Eroğlu** - Founder & Lead Developer

## 🙏 Acknowledgments

- NestJS Team for the amazing framework
- Next.js Team for the React framework
- Prisma Team for the ORM
- Turkish e-commerce community for feedback

---

**Made with ❤️ in Istanbul**

[Website](https://pazaryonetimi.com) | [API Docs](https://api.pazaryonetimi.com/api-docs) | [Support](mailto:support@pazaryonetimi.com)
