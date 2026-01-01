#!/bin/bash
# ================================
# Kubernetes Quick Start Script
# ================================
# Deploys Focus app to local Kubernetes cluster
# Requires: kubectl, base64

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Focus App - Kubernetes Setup${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Check prerequisites
echo "Checking prerequisites..."

if ! command -v kubectl &> /dev/null; then
    echo -e "${RED}❌ kubectl not found. Please install kubectl first.${NC}"
    exit 1
fi

if ! command -v base64 &> /dev/null; then
    echo -e "${RED}❌ base64 not found. Please install coreutils.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ kubectl found${NC}"

# Check cluster access
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}❌ Cannot connect to Kubernetes cluster.${NC}"
    echo "Please ensure you have a cluster running:"
    echo "  - Docker Desktop: Enable Kubernetes in settings"
    echo "  - Minikube: Run 'minikube start'"
    exit 1
fi

echo -e "${GREEN}✅ Kubernetes cluster is accessible${NC}"
echo ""

# Create secrets if not exists
echo "Setting up secrets..."

if [ ! -f "k8s/base/secrets.local.yaml" ]; then
    echo -e "${YELLOW}Creating secrets.local.yaml from template...${NC}"
    cp k8s/base/secrets.yaml k8s/base/secrets.local.yaml

    echo ""
    echo -e "${YELLOW}⚠️  Using default development secrets.${NC}"
    echo -e "${YELLOW}For production, update k8s/base/secrets.local.yaml with secure values.${NC}"
    echo ""
    echo "Generate secure secrets with:"
    echo "  echo -n 'your-secure-password' | base64"
    echo ""
else
    echo -e "${GREEN}✅ secrets.local.yaml already exists${NC}"
fi

# Apply manifests
echo "Deploying to Kubernetes..."

# Create namespace
echo "Creating namespace..."
kubectl apply -f k8s/base/namespace.yaml

# Apply secrets
echo "Applying secrets..."
kubectl apply -f k8s/base/secrets.local.yaml

# Apply all other resources
echo "Deploying resources..."
kubectl apply -f k8s/base/configmap.yaml
kubectl apply -f k8s/base/postgres-pvc.yaml
kubectl apply -f k8s/base/postgres-deployment.yaml
kubectl apply -f k8s/base/postgres-service.yaml
kubectl apply -f k8s/base/backend-deployment.yaml
kubectl apply -f k8s/base/backend-service.yaml
kubectl apply -f k8s/base/frontend-deployment.yaml
kubectl apply -f k8s/base/frontend-service.yaml

echo ""
echo -e "${GREEN}✅ Resources deployed${NC}"
echo ""

# Wait for pods
echo "Waiting for pods to be ready..."
echo "(This may take a few minutes for first-time image pulls)"
echo ""

echo "Waiting for PostgreSQL..."
kubectl wait --for=condition=ready pod -l app=postgres -n focus --timeout=120s || {
    echo -e "${RED}❌ PostgreSQL failed to start${NC}"
    echo "Check logs with: kubectl logs -n focus -l app=postgres"
    exit 1
}
echo -e "${GREEN}✅ PostgreSQL is ready${NC}"

echo "Waiting for Backend..."
kubectl wait --for=condition=ready pod -l app=backend -n focus --timeout=180s || {
    echo -e "${RED}❌ Backend failed to start${NC}"
    echo "Check logs with: kubectl logs -n focus -l app=backend"
    echo "Check migration logs: kubectl logs -n focus -l app=backend -c run-migrations"
    exit 1
}
echo -e "${GREEN}✅ Backend is ready${NC}"

echo "Waiting for Frontend..."
kubectl wait --for=condition=ready pod -l app=frontend -n focus --timeout=120s || {
    echo -e "${RED}❌ Frontend failed to start${NC}"
    echo "Check logs with: kubectl logs -n focus -l app=frontend"
    exit 1
}
echo -e "${GREEN}✅ Frontend is ready${NC}"

echo ""
echo -e "${GREEN}================================${NC}"
echo -e "${GREEN}Deployment Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo ""

# Show status
kubectl get pods -n focus
echo ""

# Access instructions
echo -e "${YELLOW}To access the services:${NC}"
echo ""
echo "Option 1: Port Forwarding (Recommended)"
echo "  # In separate terminals:"
echo "  kubectl port-forward -n focus svc/frontend 8080:80"
echo "  kubectl port-forward -n focus svc/backend 3000:3000"
echo ""
echo "  Then open:"
echo "  - Frontend: http://localhost:8080"
echo "  - Backend:  http://localhost:3000"
echo ""

echo "Option 2: Ingress (requires ingress controller)"
echo "  # Enable on Minikube:"
echo "  minikube addons enable ingress"
echo ""
echo "  # Add to /etc/hosts:"
echo "  echo \"\$(minikube ip) focus.local api.focus.local\" | sudo tee -a /etc/hosts"
echo ""
echo "  # Apply ingress:"
echo "  kubectl apply -f k8s/base/ingress.yaml"
echo ""
echo "  Then open:"
echo "  - Frontend: http://focus.local"
echo "  - Backend:  http://api.focus.local"
echo ""

echo -e "${YELLOW}Useful commands:${NC}"
echo "  kubectl get pods -n focus              # Check pod status"
echo "  kubectl logs -n focus -l app=backend -f  # Follow backend logs"
echo "  kubectl exec -it -n focus deployment/backend -- bash  # Shell into backend"
echo "  kubectl delete -k k8s/base/            # Delete all resources"
echo ""

echo -e "${GREEN}Setup complete! 🚀${NC}"
