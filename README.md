# Focus - Pomodoro Timer App

Full-stack TypeScript application for focused work sessions using the Pomodoro Technique.

## Tech Stack

- **Frontend**: React 19 + Vite + TypeScript
- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL 14 with Knex.js query builder
- **Infrastructure**: Docker Compose (dev) + Kubernetes (production)
- **Monorepo**: pnpm workspaces

## Quick Start

### Local Development

```bash
# Install dependencies
pnpm install

# Start all services (backend, frontend, postgres)
pnpm dev

# Access:
# - Frontend: http://localhost:5173
# - Backend:  http://localhost:3000
# - Postgres: localhost:5432
```

### Database Migrations

```bash
# Run pending migrations
pnpm db:migrate

# Create new migration
pnpm db:migrate:make migration_name

# Rollback last migration
pnpm db:migrate:rollback

# Reset database (rollback → migrate → seed)
pnpm db:reset
```

### Code Quality

```bash
# Run all quality checks (lint, typecheck, tests)
pnpm quality

# Run tests
pnpm test:all

# Lint and fix
pnpm lint:fix
```

## Documentation

### For Developers

- **[CLAUDE.md](./CLAUDE.md)** - Development guidelines and project overview
- **[docs/development/CONTRIBUTING.md](./docs/development/CONTRIBUTING.md)** - Contribution
  guidelines
- **[docs/development/GIT_WORKFLOW.md](./docs/development/GIT_WORKFLOW.md)** - Git branching
  strategy
- **[docs/development/MIGRATION_GUIDE.md](./docs/development/MIGRATION_GUIDE.md)** - Database
  migrations

### For Deployment

- **[docs/deployment/DEPLOYMENT.md](./docs/deployment/DEPLOYMENT.md)** - Complete deployment guide
- **[docs/deployment/CHECKLIST.md](./docs/deployment/CHECKLIST.md)** - Pre-deployment checklist
- **[k8s/README.md](./k8s/README.md)** - Kubernetes deployment instructions

### Reference

- **[docs/reference/REPOSITORY_STRUCTURE.md](./docs/reference/REPOSITORY_STRUCTURE.md)** - Project
  structure
- **[docs/reference/FILES_REFERENCE.md](./docs/reference/FILES_REFERENCE.md)** - File documentation

## Project Structure

```
focus/
├── apps/
│   ├── backend/           # NestJS API
│   │   ├── src/
│   │   │   ├── auth/      # Authentication module
│   │   │   ├── users/     # Users module
│   │   │   ├── database/  # Migrations, seeds, scripts
│   │   │   └── config/    # Environment configuration
│   │   └── test/          # E2E tests
│   └── frontend/          # React app
│       └── src/
├── packages/
│   └── shared/            # Shared types and utilities
├── k8s/                   # Kubernetes manifests
│   ├── base/              # Base configuration
│   ├── overlays/          # Environment-specific configs (qa, prod)
│   └── README.md          # K8s deployment guide
├── docs/                  # Documentation
│   ├── deployment/        # Deployment guides
│   ├── development/       # Development guides
│   └── reference/         # Reference documentation
├── docker/                # Docker configuration files
├── .github/workflows/     # CI/CD pipelines
└── docker-compose*.yml    # Docker Compose configurations
```

## Available Commands

### Development

```bash
pnpm dev                   # Start all services
pnpm dev:rebuild           # Start with rebuild
pnpm down                  # Stop all services
pnpm logs                  # View all logs
pnpm logs:backend          # View backend logs only
pnpm logs:frontend         # View frontend logs only
pnpm logs:postgres         # View postgres logs only
pnpm health                # Check service health
```

### Database

```bash
pnpm db:migrate            # Run pending migrations
pnpm db:migrate:make <name>  # Create new migration
pnpm db:migrate:rollback   # Rollback last migration
pnpm db:migrate:status     # Check migration status
pnpm db:seed               # Run seeds
pnpm db:reset              # Reset database
pnpm db:psql:interactive   # Connect to PostgreSQL
```

### Code Quality

```bash
pnpm lint:all              # Lint all packages
pnpm lint:fix              # Fix lint issues
pnpm typecheck             # Type check all packages
pnpm format                # Format code
pnpm quality               # Run all quality checks
pnpm test:all              # Run all tests
```

### Docker

```bash
pnpm shell:backend         # Shell into backend container
pnpm shell:postgres        # psql into PostgreSQL
pnpm dev:clean             # Clean restart (remove volumes)
pnpm dev:reset             # Full clean rebuild
pnpm prod                  # Start production stack
pnpm prod:build            # Build and start production
```

## Deployment

### Docker Compose (Simple)

```bash
# Production
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Staging
docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d
```

### Kubernetes (Recommended)

```bash
# Quick start (local)
./k8s/quick-start.sh

# Manual deployment
kubectl apply -k k8s/base/

# Check status
kubectl get pods -n focus
```

See **[DEPLOYMENT.md](./DEPLOYMENT.md)** for complete deployment instructions.

## CI/CD & Environments

### Environment Flow: dev → qa → prod

**Local Development (dev):**

```bash
pnpm dev  # Docker Compose with hot reload
```

**QA/Testing (qa):**

- Trigger: Push to `develop` branch
- Workflow: `deploy-k8s-qa.yml`
- Purpose: Testing before production
- URL: `https://qa.focus.yourdomain.com`

**Production (prod):**

- Trigger: Push to `main` branch (requires approval)
- Workflow: `deploy-k8s-production.yml`
- Purpose: Live production environment
- URL: `https://focus.yourdomain.com`

### Workflows

**Quality Checks:**

- `ci.yml` - Lint, typecheck, test on every push
- `docker-build.yml` - Build and push Docker images
- `docker-scan.yml` - Security scanning

**Deployment:**

- `deploy-k8s-qa.yml` - Deploy to QA (Kubernetes)
- `deploy-k8s-production.yml` - Deploy to production (Kubernetes)
- `deploy-production.yml` - Legacy Docker Compose deployment

## Environment Variables

Key environment variables (see `.env` for full list):

```bash
# Database
DATABASE_HOST=postgres
DATABASE_PORT=5432
DATABASE_USER=postgres
DATABASE_PASSWORD=postgres
DATABASE_NAME=focus_dev

# Auth
JWT_SECRET=dev-jwt-secret-for-local-testing-only-min-32-chars
JWT_EXPIRES_IN=30d

# Security
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Logging
LOG_LEVEL=debug
LOG_PRETTY=true
```

## Architecture

### Request Flow

```
Client → Nginx (frontend) → Backend API → PostgreSQL
                              ↓
                         JWT Auth
                              ↓
                         Knex.js Query Builder
                              ↓
                         Raw SQL / Migrations
```

### Database Schema

```
users (user_id, email, password_hash, ...)
  └─ pomodoros (pomodoro_id, user_id, planned_duration, ...)
```

### Security

- Non-root users in containers
- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Health checks for all services
- SQL injection protection (parameterized queries)

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for details on our code of conduct and development
process.

### Git Workflow

- `main` - Production-ready code
- `develop` - Integration branch for features
- `feature/*` - New features
- `fix/*` - Bug fixes
- `hotfix/*` - Urgent production fixes

See [GIT_WORKFLOW.md](./GIT_WORKFLOW.md) for detailed workflow.

## License

MIT License - see LICENSE file for details

## Support

- Documentation: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- Issues: Create an issue on GitHub
- Development Guide: See [CLAUDE.md](./CLAUDE.md)

---

**Built with ❤️ using TypeScript, React, NestJS, and PostgreSQL**
