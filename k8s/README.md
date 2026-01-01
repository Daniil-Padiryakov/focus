# Kubernetes Deployment Guide

Kubernetes manifests for the Focus Pomodoro app.

## Quick Start (Local Development)

### Prerequisites

- **Docker Desktop** with Kubernetes enabled, OR
- **Minikube**: `minikube start`

### 1. Setup Secrets

```bash
# Create local secrets file (not committed to git)
cp k8s/base/secrets.yaml k8s/base/secrets.local.yaml

# Generate secure secrets for production
echo -n "your-strong-db-password" | base64
echo -n "your-jwt-secret-min-32-chars-long" | base64

# Update secrets.local.yaml with generated values
```

### 2. Deploy to Local Kubernetes

```bash
# Apply all manifests
kubectl apply -k k8s/base/

# Check deployment status
kubectl get pods -n focus
kubectl get svc -n focus

# Watch for ready state
kubectl wait --for=condition=ready pod -l app=postgres -n focus --timeout=60s
kubectl wait --for=condition=ready pod -l app=backend -n focus --timeout=120s
kubectl wait --for=condition=ready pod -l app=frontend -n focus --timeout=60s
```

### 3. Access Services

#### Port Forwarding (no Ingress)

```bash
# Backend API
kubectl port-forward -n focus svc/backend 3000:3000

# Frontend
kubectl port-forward -n focus svc/frontend 8080:80

# PostgreSQL (for debugging)
kubectl port-forward -n focus svc/postgres 5432:5432
```

Access at:

- Frontend: http://localhost:8080
- Backend API: http://localhost:3000
- PostgreSQL: localhost:5432

#### Ingress (optional)

```bash
# Enable Ingress on Minikube
minikube addons enable ingress

# Add to /etc/hosts
echo "$(minikube ip) focus.local api.focus.local" | sudo tee -a /etc/hosts

# Access at:
# - http://focus.local (frontend)
# - http://api.focus.local (backend)
```

## Common Commands

### View Logs

```bash
# Backend logs
kubectl logs -n focus -l app=backend -f

# Frontend logs
kubectl logs -n focus -l app=frontend -f

# PostgreSQL logs
kubectl logs -n focus -l app=postgres -f

# Migration init container logs
kubectl logs -n focus -l app=backend -c run-migrations
```

### Database Operations

```bash
# Connect to PostgreSQL
kubectl exec -it -n focus deployment/postgres -- psql -U postgres -d focus_prod

# Run migrations manually (if needed)
kubectl exec -it -n focus deployment/backend -- pnpm --filter @focus/backend db:migrate

# Check migration status
kubectl exec -it -n focus deployment/backend -- pnpm --filter @focus/backend db:migrate:status
```

### Update Deployment

```bash
# Edit ConfigMap (non-sensitive config)
kubectl edit configmap app-config -n focus

# Edit Secrets (sensitive data)
kubectl edit secret app-secret -n focus

# Restart deployments to pick up changes
kubectl rollout restart deployment/backend -n focus
kubectl rollout restart deployment/frontend -n focus
```

### Rollback

```bash
# View rollout history
kubectl rollout history deployment/backend -n focus

# Rollback to previous version
kubectl rollout undo deployment/backend -n focus

# Rollback to specific revision
kubectl rollout undo deployment/backend -n focus --to-revision=2
```

### Cleanup

```bash
# Delete all resources
kubectl delete -k k8s/base/

# Or delete namespace (removes everything)
kubectl delete namespace focus
```

## CI/CD Integration

Workflows automatically deploy to Kubernetes on push:

- **develop** branch → staging cluster
- **main** branch → production cluster

See `.github/workflows/deploy-*.yml` for details.

## Production Deployment

### 1. Update Image Tags

Edit `k8s/base/*-deployment.yaml`:

```yaml
image: ghcr.io/daniil-padiryakov/focus/backend:v1.0.0 # Use specific tag, not :latest
```

### 2. Update ConfigMap

Edit `k8s/base/configmap.yaml`:

```yaml
data:
  database_name: 'focus_prod'
  cors_origin: 'https://focus.yourdomain.com' # Your actual domain
```

### 3. Update Secrets

```bash
# Create production secrets
kubectl create secret generic postgres-secret \
  --from-literal=username=postgres \
  --from-literal=password='your-strong-password' \
  -n focus

kubectl create secret generic app-secret \
  --from-literal=jwt_secret='your-jwt-secret-min-32-chars' \
  -n focus
```

### 4. Update Ingress

Edit `k8s/base/ingress.yaml`:

```yaml
spec:
  rules:
    - host: focus.yourdomain.com # Your domain
    - host: api.focus.yourdomain.com
```

### 5. Deploy

```bash
kubectl apply -k k8s/base/
```

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Ingress (nginx)                      │
│  focus.local (frontend) | api.focus.local (backend)     │
└──────────────┬──────────────────────┬───────────────────┘
               │                      │
               ▼                      ▼
       ┌───────────────┐      ┌──────────────┐
       │   Frontend    │      │   Backend    │
       │   Service     │      │   Service    │
       │   (ClusterIP) │      │   (ClusterIP)│
       └───────┬───────┘      └──────┬───────┘
               │                     │
               ▼                     ▼
       ┌───────────────┐      ┌──────────────┐
       │   Frontend    │      │   Backend    │
       │   Deployment  │      │   Deployment │
       │   (1 replica) │      │   (1 replica)│
       └───────────────┘      └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │  PostgreSQL  │
                              │   Service    │
                              │  (ClusterIP) │
                              └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │  PostgreSQL  │
                              │  Deployment  │
                              │  (1 replica) │
                              └──────┬───────┘
                                     │
                                     ▼
                              ┌──────────────┐
                              │     PVC      │
                              │   (5Gi)      │
                              └──────────────┘
```

## Configuration Files

- `namespace.yaml` - Namespace for all resources
- `configmap.yaml` - Non-sensitive configuration
- `secrets.yaml` - Template for sensitive data (DB password, JWT secret)
- `postgres-*.yaml` - PostgreSQL database
- `backend-*.yaml` - NestJS API server
- `frontend-*.yaml` - React frontend (Nginx)
- `ingress.yaml` - HTTP routing (optional)
- `kustomization.yaml` - Kustomize config

## Troubleshooting

### Pods not starting

```bash
# Check pod status
kubectl describe pod -n focus <pod-name>

# Check events
kubectl get events -n focus --sort-by='.lastTimestamp'
```

### Database connection errors

```bash
# Verify postgres is ready
kubectl get pod -n focus -l app=postgres

# Check backend can reach postgres
kubectl exec -n focus deployment/backend -- ping postgres

# Check secrets are mounted
kubectl exec -n focus deployment/backend -- env | grep DATABASE
```

### Migration failures

```bash
# Check init container logs
kubectl logs -n focus <backend-pod-name> -c run-migrations

# Run migrations manually
kubectl exec -it -n focus deployment/backend -- pnpm --filter @focus/backend db:migrate
```

### Image pull errors

```bash
# Create image pull secret for private registry
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=<your-username> \
  --docker-password=<your-token> \
  -n focus

# Update deployment to use secret
# Add to spec.template.spec:
# imagePullSecrets:
#   - name: ghcr-secret
```

## Next Steps

- [ ] Configure persistent storage class for your cloud provider
- [ ] Setup HTTPS with cert-manager
- [ ] Add monitoring (Prometheus/Grafana)
- [ ] Configure horizontal pod autoscaling (HPA)
- [ ] Setup backup strategy for PostgreSQL
