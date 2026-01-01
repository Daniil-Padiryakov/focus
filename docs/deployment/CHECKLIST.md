# Deployment Checklist

Use this checklist before deploying to production.

## ✅ Pre-Deployment Checklist

### 1. Configuration Files

- [ ] Update all `yourdomain.com` placeholders:
  - [ ] `.github/workflows/deploy-staging.yml` (lines 18, 110, 127, 151)
  - [ ] `.github/workflows/deploy-production.yml` (lines 18, 132, 142)
  - [ ] `.github/workflows/deploy-k8s-staging.yml` (line 20)
  - [ ] `.github/workflows/deploy-k8s-production.yml` (line 24)
  - [ ] `k8s/base/ingress.yaml` (lines 29, 38)
  - [ ] `k8s/base/configmap.yaml` (line 18)

- [ ] Update image references in K8s manifests:
  - [ ] `k8s/base/backend-deployment.yaml` (lines 22, 49)
  - [ ] `k8s/base/frontend-deployment.yaml` (line 17)

### 2. Secrets

- [ ] Generate secure database password (min 16 chars):

  ```bash
  openssl rand -base64 24
  ```

- [ ] Generate secure JWT secret (min 32 chars):

  ```bash
  openssl rand -base64 48
  ```

- [ ] For Docker Compose deployment:
  - [ ] Create `secrets/db_password.txt`
  - [ ] Create `secrets/jwt_secret.txt`

- [ ] For Kubernetes deployment:
  - [ ] Copy `k8s/base/secrets.yaml` to `k8s/base/secrets.local.yaml`
  - [ ] Update base64-encoded secrets:
    ```bash
    echo -n "your-password" | base64
    echo -n "your-jwt-secret" | base64
    ```
  - [ ] Update `secrets.local.yaml` with encoded values

### 3. GitHub Secrets

Choose your deployment method and configure required secrets:

#### Docker Compose Deployment

- [ ] `STAGING_SSH_KEY` - SSH private key for staging server
- [ ] `STAGING_USER` - SSH username
- [ ] `STAGING_HOST` - Server IP or hostname
- [ ] `PRODUCTION_SSH_KEY` - SSH private key for production server
- [ ] `PRODUCTION_USER` - SSH username
- [ ] `PRODUCTION_HOST` - Server IP or hostname
- [ ] `SLACK_WEBHOOK` - (Optional) Slack webhook for notifications

#### Kubernetes Deployment

- [ ] `STAGING_KUBECONFIG` - Base64-encoded kubeconfig for staging cluster
  ```bash
  cat ~/.kube/config | base64 -w 0
  ```
- [ ] `PRODUCTION_KUBECONFIG` - Base64-encoded kubeconfig for production cluster
- [ ] `SLACK_WEBHOOK` - (Optional) Slack webhook for notifications

### 4. DNS Configuration

- [ ] Point domain to server/cluster:
  - [ ] `yourdomain.com` → Load balancer IP
  - [ ] `api.yourdomain.com` → Load balancer IP
  - [ ] `staging.yourdomain.com` → Staging server IP
  - [ ] `api-staging.yourdomain.com` → Staging server IP

- [ ] Verify DNS propagation:
  ```bash
  dig yourdomain.com
  dig api.yourdomain.com
  ```

### 5. SSL/TLS Certificates

- [ ] For Docker Compose:
  - [ ] Setup Let's Encrypt with certbot
  - [ ] Configure Nginx reverse proxy with SSL

- [ ] For Kubernetes:
  - [ ] Install cert-manager
  - [ ] Create ClusterIssuer for Let's Encrypt
  - [ ] Update Ingress with TLS configuration

### 6. Database

- [ ] Verify migrations are up to date:

  ```bash
  pnpm db:migrate:status
  ```

- [ ] Create database backup strategy:
  - [ ] Automated daily backups
  - [ ] Backup retention policy (7 days)
  - [ ] Backup verification process

### 7. Testing

- [ ] Test locally with Docker Compose:

  ```bash
  docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
  ```

- [ ] Test locally with Kubernetes:

  ```bash
  ./k8s/quick-start.sh
  ```

- [ ] Verify all services are healthy:

  ```bash
  curl http://localhost:3000/health
  ```

- [ ] Test database migrations:

  ```bash
  pnpm db:migrate
  ```

- [ ] Run integration tests:
  ```bash
  pnpm test:all
  ```

### 8. Monitoring & Logging

- [ ] Configure log aggregation (optional):
  - [ ] ELK Stack / Loki
  - [ ] CloudWatch / Stackdriver

- [ ] Setup monitoring (optional):
  - [ ] Prometheus + Grafana
  - [ ] Uptime monitoring (UptimeRobot, Pingdom)

- [ ] Configure alerting:
  - [ ] Slack/Email notifications
  - [ ] PagerDuty for critical alerts

### 9. Security

- [ ] Update firewall rules:
  - [ ] Allow only necessary ports (80, 443, 22)
  - [ ] Block direct database access from internet

- [ ] Enable Docker security scanning:
  - [ ] Workflow already configured in `.github/workflows/docker-scan.yml`

- [ ] Review CORS configuration:
  - [ ] Update `CORS_ORIGIN` in ConfigMap/environment

- [ ] Setup rate limiting (optional):
  - [ ] Nginx rate limiting
  - [ ] Application-level rate limiting

### 10. Documentation

- [ ] Update team documentation with:
  - [ ] Production URLs
  - [ ] Deployment procedures
  - [ ] Rollback procedures
  - [ ] Emergency contacts

## 🚀 Deployment Steps

### Docker Compose Deployment

1. **Staging**
   - [ ] Push to `develop` branch
   - [ ] Verify GitHub Actions workflow runs
   - [ ] Check staging deployment: `https://staging.yourdomain.com`
   - [ ] Run smoke tests

2. **Production**
   - [ ] Merge `develop` to `main`
   - [ ] Approve production deployment in GitHub
   - [ ] Monitor deployment workflow
   - [ ] Verify production: `https://yourdomain.com`
   - [ ] Run smoke tests

### Kubernetes Deployment

1. **Staging**
   - [ ] Push to `develop` branch
   - [ ] Verify K8s staging workflow runs
   - [ ] Check pods: `kubectl get pods -n focus`
   - [ ] Verify deployment: `https://staging.yourdomain.com`

2. **Production**
   - [ ] Merge `develop` to `main`
   - [ ] Approve production deployment
   - [ ] Monitor rollout: `kubectl rollout status deployment/backend -n focus`
   - [ ] Verify pods: `kubectl get pods -n focus`
   - [ ] Test production: `https://yourdomain.com`

## 🔄 Post-Deployment

- [ ] Monitor application logs:

  ```bash
  # Docker Compose
  docker compose logs -f

  # Kubernetes
  kubectl logs -n focus -l app=backend -f
  ```

- [ ] Check resource usage:

  ```bash
  # Docker
  docker stats

  # Kubernetes
  kubectl top pods -n focus
  ```

- [ ] Verify database migrations ran:

  ```bash
  # Docker Compose
  docker compose exec backend pnpm --filter @focus/backend db:migrate:status

  # Kubernetes
  kubectl exec -n focus deployment/backend -- pnpm --filter @focus/backend db:migrate:status
  ```

- [ ] Create database backup:

  ```bash
  # Docker Compose
  docker compose exec postgres pg_dump -U postgres focus_prod > backup.sql

  # Kubernetes
  kubectl exec -n focus deployment/postgres -- pg_dump -U postgres focus_prod > backup.sql
  ```

- [ ] Update documentation with deployment timestamp

## 🆘 Rollback Procedure

### Docker Compose

```bash
# SSH to server
ssh user@server

# Pull previous images
docker pull ghcr.io/daniil-padiryakov/focus/backend:main-previous
docker pull ghcr.io/daniil-padiryakov/focus/frontend:main-previous

# Tag and restart
export BACKEND_IMAGE=ghcr.io/daniil-padiryakov/focus/backend:main-previous
export FRONTEND_IMAGE=ghcr.io/daniil-padiryakov/focus/frontend:main-previous
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d
```

### Kubernetes

```bash
# Rollback backend
kubectl rollout undo deployment/backend -n focus

# Rollback frontend
kubectl rollout undo deployment/frontend -n focus

# Monitor rollback
kubectl rollout status deployment/backend -n focus
```

## 📋 Common Issues

### Issue: Pods stuck in ImagePullBackOff

**Solution:**

```bash
# Create image pull secret
kubectl create secret docker-registry ghcr-secret \
  --docker-server=ghcr.io \
  --docker-username=daniil-padiryakov \
  --docker-password=$GITHUB_TOKEN \
  -n focus

# Update deployment
kubectl patch deployment backend -n focus -p \
  '{"spec":{"template":{"spec":{"imagePullSecrets":[{"name":"ghcr-secret"}]}}}}'
```

### Issue: Database connection errors

**Solution:**

```bash
# Check postgres is running
kubectl get pod -n focus -l app=postgres

# Check secrets are mounted
kubectl exec -n focus deployment/backend -- env | grep DATABASE

# Test connection
kubectl exec -n focus deployment/backend -- ping postgres
```

### Issue: Migration failures

**Solution:**

```bash
# Check migration logs
kubectl logs -n focus <backend-pod> -c run-migrations

# Run manually
kubectl exec -it -n focus deployment/backend -- pnpm --filter @focus/backend db:migrate
```

## ✅ Success Criteria

Deployment is successful when:

- [ ] All pods are in Running state (K8s) or containers are healthy (Docker)
- [ ] Health endpoint returns 200: `curl https://api.yourdomain.com/health`
- [ ] Frontend is accessible: `https://yourdomain.com`
- [ ] Database migrations completed successfully
- [ ] No errors in application logs
- [ ] Users can register/login
- [ ] Pomodoro sessions work correctly

## 📚 Resources

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [k8s/README.md](./k8s/README.md) - Kubernetes deployment
- [CLAUDE.md](./CLAUDE.md) - Development guidelines

---

**Last Updated:** December 26, 2024 **Next Review:** Before first production deployment
