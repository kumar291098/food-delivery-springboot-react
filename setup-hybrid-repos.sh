#!/usr/bin/env bash
# ==============================================================================
# Food Delivery System - Hybrid Multi-Repo & Monorepo Initialization Script (Bash)
# ==============================================================================

GITHUB_ORG="${1:-kumar291098}"

echo "=========================================================="
echo " 🚀 Initializing Backend Multi-Repo & Frontend Monorepo"
echo " Target GitHub User/Org: $GITHUB_ORG"
echo "=========================================================="

SERVICES=(
  "frontend:food-delivery-frontend:Frontend Monorepo"
  "config-server:food-delivery-config-server:Backend Microservice"
  "discovery-service:food-delivery-discovery-service:Backend Microservice"
  "gateway-service:food-delivery-gateway-service:Backend Microservice"
  "user-service:food-delivery-user-service:Backend Microservice"
  "restaurant-service:food-delivery-restaurant-service:Backend Microservice"
  "order-service:food-delivery-order-service:Backend Microservice"
  "payment-service:food-delivery-payment-service:Backend Microservice"
  "notification-service:food-delivery-notification-service:Backend Microservice"
  "config-repo:food-delivery-config-repo:Config Repository"
)

for ENTRY in "${SERVICES[@]}"; do
  IFS=":" read -r DIR REPO TYPE <<< "$ENTRY"

  if [ -d "$DIR" ]; then
    echo -e "\n--> Initializing standalone Git repo for: $DIR ($TYPE)"
    cd "$DIR" || exit

    if [ ! -d ".git" ]; then
      git init -q
      git branch -M main
    fi

    if [ -f "mvnw" ]; then
      chmod +x mvnw
      git update-index --chmod=+x mvnw 2>/dev/null || true
    fi

    git add .
    git commit -m "feat: initial commit for $REPO ($TYPE) with CI/CD" --allow-empty -q

    if [ -n "$GITHUB_ORG" ]; then
      REMOTE_URL="https://github.com/$GITHUB_ORG/$REPO.git"
      git remote remove origin 2>/dev/null || true
      git remote add origin "$REMOTE_URL"

      if command -v gh &> /dev/null; then
        echo "    Creating/pushing repository with GitHub CLI..."
        gh repo create "$GITHUB_ORG/$REPO" --public --source=. --remote=origin --push 2>/dev/null || true
      else
        echo "    Remote configured: $REMOTE_URL"
      fi
    fi

    cd ..
  fi
done

echo "=========================================================="
echo " ✅ All Standalone Repositories Initialized Successfully!"
echo "=========================================================="
