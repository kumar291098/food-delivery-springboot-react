# ==============================================================================
# Food Delivery System - Hybrid Multi-Repo & Monorepo Initialization Script (PowerShell)
# ==============================================================================
param (
    [string]$GithubOrg = "kumar291098"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " 🚀 Initializing Backend Multi-Repo & Frontend Monorepo" -ForegroundColor Green
Write-Host " Target GitHub User/Org: $GithubOrg" -ForegroundColor Yellow
Write-Host "==========================================================" -ForegroundColor Cyan

$Targets = @(
    @{ Name = "frontend"; RepoName = "food-delivery-frontend"; Type = "Frontend Monorepo" },
    @{ Name = "config-server"; RepoName = "food-delivery-config-server"; Type = "Backend Microservice" },
    @{ Name = "discovery-service"; RepoName = "food-delivery-discovery-service"; Type = "Backend Microservice" },
    @{ Name = "gateway-service"; RepoName = "food-delivery-gateway-service"; Type = "Backend Microservice" },
    @{ Name = "user-service"; RepoName = "food-delivery-user-service"; Type = "Backend Microservice" },
    @{ Name = "restaurant-service"; RepoName = "food-delivery-restaurant-service"; Type = "Backend Microservice" },
    @{ Name = "order-service"; RepoName = "food-delivery-order-service"; Type = "Backend Microservice" },
    @{ Name = "payment-service"; RepoName = "food-delivery-payment-service"; Type = "Backend Microservice" },
    @{ Name = "notification-service"; RepoName = "food-delivery-notification-service"; Type = "Backend Microservice" },
    @{ Name = "config-repo"; RepoName = "food-delivery-config-repo"; Type = "Config Repository" }
)

foreach ($target in $Targets) {
    $dirName = $target.Name
    $repoName = $target.RepoName
    $type = $target.Type

    if (Test-Path $dirName) {
        Write-Host "`n--> Initializing standalone Git repo for: $dirName ($type)" -ForegroundColor Yellow
        Push-Location $dirName

        if (-not (Test-Path ".git")) {
            git init | Out-Null
            git branch -M main | Out-Null
        }

        # Set executable permissions on git index if scripts or wrappers exist
        if (Test-Path "mvnw") { git update-index --chmod=+x mvnw 2>$null }

        git add .
        git commit -m "feat: initial commit for $repoName ($type) with CI/CD" --allow-empty | Out-Null

        if ($GithubOrg -ne "") {
            $remoteUrl = "https://github.com/$GithubOrg/$repoName.git"
            
            # Configure or update origin remote
            $existingRemote = git remote get-url origin 2>$null
            if ($existingRemote) {
                git remote set-url origin $remoteUrl
            } else {
                git remote add origin $remoteUrl
            }

            Write-Host "    Configured Remote: $remoteUrl" -ForegroundColor Gray

            # Check if GitHub CLI is installed and user wants to create/push
            if (Get-Command gh -ErrorAction SilentlyContinue) {
                Write-Host "    Checking/Creating GitHub repo with gh CLI..." -ForegroundColor Cyan
                gh repo create "$GithubOrg/$repoName" --public --source=. --remote=origin --push 2>$null
            } else {
                Write-Host "    [Notice] To create on GitHub, run: gh repo create $GithubOrg/$repoName --public --source=. --remote=origin --push" -ForegroundColor DarkGray
            }
        }

        Pop-Location
    }
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " ✅ All Standalone Repositories Initialized Successfully!" -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Cyan
