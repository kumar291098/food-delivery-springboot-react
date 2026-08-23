#!/usr/bin/env bash
# Bash script to split and initialize independent Git repositories for each microservice and frontend app

GITHUB_ORG="${1:-}"

SERVICES=(
  "config-server"
  "config-repo"
  "discovery-service"
  "gateway-service"
  "user-service"
  "restaurant-service"
  "order-service"
  "payment-service"
  "notification-service"
  "frontend-user"
  "frontend-restaurant"
  "frontend-delivery"
)

echo "=========================================================="
echo " Food Delivery Platform - Standalone Repositories Initializer "
echo "=========================================================="

for SVC in "${SERVICES[@]}"; do
  if [ -d "$SVC" ]; then
    echo -e "\n--> Initializing Git Repository for: $SVC"
    cd "$SVC" || exit

    if [ ! -d ".git" ]; then
      git init
      git branch -M main
    fi

    if [ ! -f ".gitignore" ]; then
      if [[ "$SVC" == frontend* ]]; then
        echo -e "node_modules/\ndist/\n.env.local\n.DS_Store" > .gitignore
      else
        echo -e "target/\n*.class\n.idea/\n*.iml\n.DS_Store\n.project\n.settings/" > .gitignore
      fi
    fi

    git add .
    git commit -m "Initial commit for $SVC standalone repository" --allow-empty

    if [ -n "$GITHUB_ORG" ]; then
      REPO_NAME="food-delivery-$SVC"
      echo "Creating GitHub repository: $GITHUB_ORG/$REPO_NAME"
      if command -v gh &> /dev/null; then
        gh repo create "$GITHUB_ORG/$REPO_NAME" --public --source=. --remote=origin --push
      else
        echo "GitHub CLI (gh) not found. To push to GitHub, run:"
        echo "  git remote add origin https://github.com/$GITHUB_ORG/$REPO_NAME.git"
        echo "  git push -u origin main"
      fi
    fi

    cd ..
  else
    echo "Directory $SVC does not exist. Skipping..."
  fi
done

echo "=========================================================="
echo " Local Git Repositories initialized for all services! "
echo "=========================================================="
