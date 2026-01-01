# Deployment Guide

Quick reference for deploying the Focus app to Kubernetes.

## Table of Contents

- [Local Development (Docker Compose)](#local-development-docker-compose)
- [Kubernetes Deployment](#kubernetes-deployment)
- [CI/CD Workflows](#cicd-workflows)
- [Troubleshooting](#troubleshooting)

---

## Local Development (Docker Compose)

### Start all services

```bash
# Start with hot reload
pnpm dev

# Or with docker compose directly
docker compose -f docker-compose.yml -f docker-compose.dev.yml up

# Stop services
pnpm down
```

### Common issues

#### Port conflicts

```bash
# Check what's using port 5432 (PostgreSQL)
lsof -i :5432

# Kill process
kill -9 <PID>
```

#### Database connection errors

```bash
# Check postgres is healthy
docker compose ps postgres

# View logs
pnpm logs:postgres

# Reset database
pnpm db:reset
```

---

## Kubernetes Deployment

### Prerequisites

**Local testing:**

- Docker Desktop with Kubernetes enabled, OR
- Minikube: `minikube start`

**Production:**

- Access to Kubernetes cluster
- `kubectl` configured with cluster credentials

### Initial Setup

#### 1. Create Secrets

```bash
# Navigate to k8s directory
cd k8s/base

# Copy template
cp secrets.yaml secrets.local.yaml

# Generate secure values
echo -n "your-secure-db-password" | base64
echo -n "your-jwt-secret-minimum-32-chars-long" | base64

# Edit secrets.local.yaml with generated base64 values
# IMPORTANT: Never commit secrets.local.yaml to git!
```

#### 2. Update ConfigMap

Edit `k8s/base/configmap.yaml`:

```yaml
data:
  database_name: 'focus_prod' # or focus_staging, focus_dev
  cors_origin: 'https://yourdomain.com,https://www.yourdomain.com'
```

#### 3. Update Image References

For production, edit deployment files to use specific tags:

```bash
# Edit k8s/base/backend-deployment.yaml
# Change:
image: ghcr.io/daniil-padiryakov/focus/backend:develop
# To:
image: ghcr.io/daniil-padiryakov/focus/backend:v1.0.0

# Same for frontend-deployment.yaml
```

#### 4. Update Ingress (Optional)

If using Ingress for external access, edit `k8s/base/ingress.yaml`:

```yaml
spec:
  rules:
    - host: focus.yourdomain.com # Your domain
    - host: api.focus.yourdomain.com
```

### Deploy to Local Kubernetes

```bash
# Create namespace and deploy all resources
kubectl apply -k k8s/base/

# Or use local secrets
kubectl apply -f k8s/base/secrets.local.yaml
kubectl apply -k k8s/base/

# Wait for pods to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n focus --timeout=120s
kubectl wait --for=condition=ready pod -l app=backend -n focus --timeout=180s
kubectl wait --for=condition=ready pod -l app=frontend -n focus --timeout=120s

# Check status
kubectl get pods -n focus
kubectl get svc -n focus
```

### Access Services Locally

#### Option 1: Port Forwarding (Recommended for testing)

```bash
# Terminal 1 - Backend
kubectl port-forward -n focus svc/backend 3000:3000

# Terminal 2 - Frontend
kubectl port-forward -n focus svc/frontend 8080:80

# Terminal 3 - PostgreSQL (for debugging)
kubectl port-forward -n focus svc/postgres 5432:5432
```

Access:

- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432

#### Option 2: Ingress (For realistic setup)

```bash
# Enable Ingress on Minikube
minikube addons enable ingress

# Get Minikube IP
minikube ip
# Example output: 192.168.49.2

# Add to /etc/hosts (Linux/Mac) or C:\Windows\System32\drivers\etc\hosts (Windows)
192.168.49.2 focus.local api.focus.local
```

Access:

- Frontend: http://focus.local
- Backend API: http://api.focus.local

### Verify Deployment

```bash
# Check all pods are running
kubectl get pods -n focus

# Check services
kubectl get svc -n focus

# Check ingress (if enabled)
kubectl get ingress -n focus

# Test backend health
kubectl port-forward -n focus svc/backend 3000:3000 &
curl http://localhost:3000/health
# Should return: {"status":"ok", ...}

# View logs
kubectl logs -n focus -l app=backend -f
```

---

## CI/CD Workflows

### Docker Compose Workflows

**Files:**

- `.github/workflows/deploy-staging.yml` - Deploy to staging via SSH + Docker Compose
- `.github/workflows/deploy-production.yml` - Deploy to production via SSH + Docker Compose

**Required Secrets:**

- `STAGING_SSH_KEY` - SSH private key for staging server
- `STAGING_USER` - SSH username
- `STAGING_HOST` - Server hostname/IP
- `PRODUCTION_SSH_KEY` - SSH private key for production server
- `PRODUCTION_USER` - SSH username
- `PRODUCTION_HOST` - Server hostname/IP
- `SLACK_WEBHOOK` - (Optional) Slack notifications

**Usage:**

- Push to `develop` → Deploys to staging
- Push to `main` → Deploys to production (requires approval)

### Kubernetes Workflows

**Files:**

- `.github/workflows/deploy-k8s-staging.yml` - Deploy to K8s staging cluster
- `.github/workflows/deploy-k8s-production.yml` - Deploy to K8s production cluster

**Required Secrets:**

- `STAGING_KUBECONFIG` - Base64-encoded kubeconfig for staging cluster
- `PRODUCTION_KUBECONFIG` - Base64-encoded kubeconfig for production cluster
- `SLACK_WEBHOOK` - (Optional) Slack notifications

**Setup Kubeconfig Secret:**

```bash
# Get your kubeconfig
cat ~/.kube/config

# Encode to base64
cat ~/.kube/config | base64 | pbcopy  # Mac
cat ~/.kube/config | base64 -w 0      # Linux

# Add to GitHub Secrets:
# Settings → Secrets and variables → Actions → New repository secret
# Name: STAGING_KUBECONFIG or PRODUCTION_KUBECONFIG
# Value: <paste base64 output>
```

**Usage:**

- Push to `develop` → Deploys to staging K8s cluster
- Push to `main` → Deploys to production K8s cluster (requires approval)

### Workflow Features

**Both workflows include:**

- ✅ Database migrations (automatic)
- ✅ Health checks (backend + frontend)
- ✅ Automatic rollback on failure
- ✅ Slack notifications (optional)

**Kubernetes workflows additionally include:**

- ✅ Database backup before deployment
- ✅ Gradual rollout with monitoring
- ✅ Revision history (can rollback to any version)

---

## Database Operations

### Run Migrations

```bash
# Get backend pod name
BACKEND_POD=$(kubectl get pod -n focus -l app=backend -o jsonpath='{.items[0].metadata.name}')

# Run migrations
kubectl exec -n focus $BACKEND_POD -- pnpm --filter @focus/backend db:migrate

# Check migration status
kubectl exec -n focus $BACKEND_POD -- pnpm --filter @focus/backend db:migrate:status

# Rollback last migration
kubectl exec -n focus $BACKEND_POD -- pnpm --filter @focus/backend db:migrate:rollback
```

### Create Backup

```bash
# Get postgres pod
POSTGRES_POD=$(kubectl get pod -n focus -l app=postgres -o jsonpath='{.items[0].metadata.name}')

# Create backup
kubectl exec -n focus $POSTGRES_POD -- pg_dump -U postgres focus_prod | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Restore Backup

```bash
# Copy backup to pod
kubectl cp backup.sql.gz focus/$POSTGRES_POD:/tmp/backup.sql.gz

# Restore
kubectl exec -n focus $POSTGRES_POD -- bash -c "gunzip < /tmp/backup.sql.gz | psql -U postgres focus_prod"
```

### Connect to PostgreSQL

```bash
# Interactive psql session
kubectl exec -it -n focus deployment/postgres -- psql -U postgres -d focus_prod

# Or via port-forward
kubectl port-forward -n focus svc/postgres 5432:5432 &
psql -h localhost -U postgres -d focus_prod
```

---

## Scaling

### Manual Scaling

```bash
# Scale backend
kubectl scale deployment/backend --replicas=3 -n focus

# Scale frontend
kubectl scale deployment/frontend --replicas=2 -n focus

# Check status
kubectl get pods -n focus
```

### Auto-scaling (HPA)

```bash
# Create HPA for backend (scales based on CPU)
kubectl autoscale deployment backend --cpu-percent=70 --min=1 --max=5 -n focus

# Check HPA status
kubectl get hpa -n focus

# Delete HPA
kubectl delete hpa backend -n focus
```

---

## Rollback

### View Rollout History

```bash
# Backend history
kubectl rollout history deployment/backend -n focus

# Frontend history
kubectl rollout history deployment/frontend -n focus
```

### Rollback to Previous Version

```bash
# Rollback backend
kubectl rollout undo deployment/backend -n focus

# Rollback frontend
kubectl rollout undo deployment/frontend -n focus

# Wait for rollback to complete
kubectl rollout status deployment/backend -n focus
```

### Rollback to Specific Revision

```bash
# View specific revision details
kubectl rollout history deployment/backend -n focus --revision=2

# Rollback to revision 2
kubectl rollout undo deployment/backend -n focus --to-revision=2
```

---

## Update Configuration

### Update ConfigMap

```bash
# Edit ConfigMap
kubectl edit configmap app-config -n focus

# Or apply updated file
kubectl apply -f k8s/base/configmap.yaml

# Restart deployments to pick up changes
kubectl rollout restart deployment/backend -n focus
kubectl rollout restart deployment/frontend -n focus
```

### Update Secrets

```bash
# Edit secrets directly (values are base64 encoded)
kubectl edit secret app-secret -n focus

# Or create new secret from literal
kubectl create secret generic app-secret \
  --from-literal=jwt_secret='new-secret-value' \
  --dry-run=client -o yaml | kubectl apply -f - -n focus

# Restart deployments
kubectl rollout restart deployment/backend -n focus
```

---

## Cleanup

### Delete All Resources

```bash
# Delete everything in namespace
kubectl delete -k k8s/base/

# Or delete namespace (removes everything including PVC data)
kubectl delete namespace focus
```

### Delete Specific Resources

```bash
# Delete deployment
kubectl delete deployment backend -n focus

# Delete service
kubectl delete svc backend -n focus

# Delete PVC (deletes database data!)
kubectl delete pvc postgres-pvc -n focus
```

---

## Troubleshooting

### Pods not starting

```bash
# Describe pod to see events
kubectl describe pod -n focus <pod-name>

# Check pod logs
kubectl logs -n focus <pod-name>

# Check init container logs (migrations)
kubectl logs -n focus <backend-pod-name> -c run-migrations

# Get all events
kubectl get events -n focus --sort-by='.lastTimestamp'
```

### ImagePullBackOff

```bash
# Check image exists
docker manifest inspect ghcr.io/daniil-padiryakov/focus/backend:develop

# Create image pull secret for private registry
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=daniil-padiryakov \
  --docker-password=<github-token> \
  -n focus

# Update deployment to use secret
kubectl patch deployment backend -n focus -p '{"spec":{"template":{"spec":{"imagePullSecrets":[{"name":"ghcr-secret"}]}}}}'
```

### Database connection errors

```bash
# Check postgres is running
kubectl get pod -n focus -l app=postgres

# Check postgres logs
kubectl logs -n focus -l app=postgres

# Test connection from backend pod
kubectl exec -n focus deployment/backend -- ping postgres

# Check secrets are mounted correctly
kubectl exec -n focus deployment/backend -- env | grep DATABASE
```

### Migration failures

```bash
# Check migration init container logs
kubectl logs -n focus <backend-pod-name> -c run-migrations

# Run migrations manually
kubectl exec -it -n focus deployment/backend -- pnpm --filter @focus/backend db:migrate

# Check migration status
kubectl exec -it -n focus deployment/backend -- pnpm --filter @focus/backend db:migrate:status
```

### CrashLoopBackOff

```bash
# View recent logs
kubectl logs -n focus <pod-name> --previous

# Describe pod for restart count
kubectl describe pod -n focus <pod-name>

# Check resource limits
kubectl describe pod -n focus <pod-name> | grep -A 5 Limits
```

### Service not accessible

```bash
# Check service exists
kubectl get svc -n focus

# Check endpoints (should match pod IPs)
kubectl get endpoints -n focus

# Test from another pod
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -n focus -- curl http://backend:3000/health
```

---

## Monitoring

### View Logs

```bash
# Follow backend logs
kubectl logs -n focus -l app=backend -f

# View last 100 lines
kubectl logs -n focus -l app=backend --tail=100

# View logs from specific time
kubectl logs -n focus -l app=backend --since=1h
```

### Resource Usage

```bash
# Check resource usage
kubectl top pods -n focus
kubectl top nodes

# Check resource requests/limits
kubectl describe deployment backend -n focus | grep -A 10 Limits
```

### Events

```bash
# Watch events in real-time
kubectl get events -n focus -w

# Filter by type
kubectl get events -n focus --field-selector type=Warning
```

---

## Advanced Topics

### Using Kustomize Overlays

Create environment-specific configurations:

```bash
# Directory structure
k8s/
  base/           # Base configuration
  overlays/
    dev/          # Development overrides
    staging/      # Staging overrides
    prod/         # Production overrides

# Apply overlay
kubectl apply -k k8s/overlays/staging/
```

### HTTPS with cert-manager

```bash
# Install cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Create ClusterIssuer for Let's Encrypt
# See k8s/base/ingress.yaml for TLS configuration
```

### Persistent Volume Backup

```bash
# Install Velero for cluster backups
# https://velero.io/docs/

# Create backup
velero backup create focus-backup --include-namespaces focus

# Restore
velero restore create --from-backup focus-backup
```

---

## Quick Reference

### Essential Commands

```bash
# Status
kubectl get all -n focus
kubectl get pods -n focus -o wide

# Logs
kubectl logs -n focus -l app=backend -f

# Exec
kubectl exec -it -n focus deployment/backend -- bash

# Port forward
kubectl port-forward -n focus svc/backend 3000:3000

# Restart
kubectl rollout restart deployment/backend -n focus

# Rollback
kubectl rollout undo deployment/backend -n focus

# Scale
kubectl scale deployment/backend --replicas=3 -n focus

# Delete
kubectl delete pod <pod-name> -n focus  # Pod will be recreated
```

### Useful Aliases

Add to `~/.bashrc` or `~/.zshrc`:

```bash
alias k='kubectl'
alias kf='kubectl -n focus'
alias kgp='kubectl get pods -n focus'
alias kgs='kubectl get svc -n focus'
alias klf='kubectl logs -n focus -f'
alias kef='kubectl exec -it -n focus'
alias kdesc='kubectl describe -n focus'
```

Usage:

```bash
kgp              # Get pods in focus namespace
klf -l app=backend  # Follow backend logs
kef deployment/backend -- bash  # Shell into backend
```

---

## Resources

- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [kubectl Cheat Sheet](https://kubernetes.io/docs/reference/kubectl/cheatsheet/)
- [Project README](./README.md)
- [Kubernetes Setup Guide](./k8s/README.md)
- [CLAUDE.md](./CLAUDE.md) - Development guidelines
