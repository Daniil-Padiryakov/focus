# Quick Start Guide

## For Local Development

```bash
# 1. Install dependencies
pnpm install

# 2. Start all services
pnpm dev

# 3. Access application
# Frontend: http://localhost:5173
# Backend:  http://localhost:3000
```

That's it! Everything else is automated.

---

## For Deployment (First Time)

### Step 1: Update Placeholders (15 minutes)

Replace `yourdomain.com` with your actual domain:

```bash
# Find all instances
grep -r "yourdomain.com" .github/workflows/ k8s/ docs/

# Replace (example):
find .github/workflows k8s -type f -name "*.yml" -o -name "*.yaml" | \
  xargs sed -i 's/yourdomain.com/focus.example.com/g'
```

### Step 2: Configure GitHub Secrets (10 minutes)

Go to: **Settings → Secrets and variables → Actions → New repository secret**

Add:

```
QA_KUBECONFIG           - Your QA cluster kubeconfig (base64-encoded)
PRODUCTION_KUBECONFIG   - Your prod cluster kubeconfig (base64-encoded)
```

**Get kubeconfig:**

```bash
cat ~/.kube/config | base64 -w 0
```

### Step 3: Setup Kubernetes Secrets (10 minutes)

```bash
cd k8s/base

# Copy template
cp secrets.yaml secrets.local.yaml

# Generate secure values
echo -n "$(openssl rand -base64 32)" | base64  # DB password
echo -n "$(openssl rand -base64 48)" | base64  # JWT secret

# Edit secrets.local.yaml with generated values

# Apply to cluster
kubectl apply -f secrets.local.yaml -n focus-qa    # For QA
kubectl apply -f secrets.local.yaml -n focus       # For production
```

### Step 4: Deploy to QA

```bash
# Push to develop branch
git checkout develop
git add .
git commit -m "feat: initial deployment setup"
git push origin develop

# This triggers automatic deployment to QA
# Watch progress: GitHub → Actions
```

### Step 5: Deploy to Production

```bash
# After QA verified, merge to main
git checkout main
git merge develop
git push origin main

# This requires manual approval in GitHub Actions
# Go to: GitHub → Actions → approve deployment
```

---

## Environment URLs

After deployment, access at:

- **QA:** https://qa.focus.example.com (replace with your domain)
- **Production:** https://focus.example.com (replace with your domain)

---

## Common Commands

```bash
# Local development
pnpm dev                    # Start all services
pnpm down                   # Stop all services
pnpm logs:backend           # View backend logs
pnpm db:migrate             # Run migrations

# Database
pnpm db:reset               # Reset database
pnpm db:psql:interactive    # Connect to PostgreSQL

# Code quality
pnpm quality                # Run all checks
pnpm lint:fix               # Fix linting issues
pnpm test:all               # Run all tests

# Kubernetes
kubectl get pods -n focus-qa           # Check QA pods
kubectl logs -n focus -l app=backend   # View prod backend logs
kubectl port-forward -n focus svc/frontend 8080:80  # Access locally
```

---

## Troubleshooting

### Local dev not starting?

```bash
# Check if ports are in use
lsof -i :5173  # Frontend
lsof -i :3000  # Backend
lsof -i :5432  # PostgreSQL

# Clean restart
pnpm dev:clean
```

### Deployment failed?

```bash
# Check GitHub Actions logs
# GitHub → Actions → click on failed workflow

# Check Kubernetes pods
kubectl get pods -n focus-qa
kubectl describe pod <pod-name> -n focus-qa
kubectl logs <pod-name> -n focus-qa
```

### Database connection error?

```bash
# Local
pnpm logs:postgres

# Kubernetes
kubectl logs -n focus -l app=postgres
```

---

## Documentation

- **[README.md](./README.md)** - Project overview
- **[AUDIT_REPORT.md](./AUDIT_REPORT.md)** - Complete audit findings
- **[docs/deployment/DEPLOYMENT.md](./docs/deployment/DEPLOYMENT.md)** - Full deployment guide
- **[docs/deployment/CHECKLIST.md](./docs/deployment/CHECKLIST.md)** - Pre-deployment checklist

---

## Support

- **Documentation:** See `docs/` folder
- **Issues:** Create an issue on GitHub
- **Audit Report:** See `AUDIT_REPORT.md` for detailed findings

---

**You're ready to start! 🚀**
