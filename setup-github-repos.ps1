# PowerShell script to split and initialize independent Git repositories for each microservice and frontend app

Param(
    [string]$GitHubOrgOrUsername = ""
)

$services = @(
    "config-server",
    "config-repo",
    "discovery-service",
    "gateway-service",
    "user-service",
    "restaurant-service",
    "order-service",
    "payment-service",
    "notification-service",
    "frontend-user",
    "frontend-restaurant",
    "frontend-delivery"
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Food Delivery Platform - Standalone Repositories Initializer " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

foreach ($svc in $services) {
    if (Test-Path $svc) {
        Write-Host "`n--> Initializing Git Repository for: $svc" -ForegroundColor Green
        Push-Location $svc

        if (-not (Test-Path ".git")) {
            git init
            git branch -M main
        }

        # Create .gitignore if missing
        if (-not (Test-Path ".gitignore")) {
            if ($svc.StartsWith("frontend")) {
                Set-Content -Path ".gitignore" -Value "node_modules/`ndist/`n.env.local`n.DS_Store"
            } else {
                Set-Content -Path ".gitignore" -Value "target/`n*.class`n.idea/`n*.iml`n.DS_Store`n.project`n.settings/"
            }
        }

        git add .
        git commit -m "Initial commit for $svc standalone repository" --allow-empty

        if ($GitHubOrgOrUsername -ne "") {
            $repoName = "food-delivery-$svc"
            Write-Host "Creating GitHub repository: $GitHubOrgOrUsername/$repoName" -ForegroundColor Yellow
            
            # Check if GitHub CLI (gh) is installed
            if (Get-Command gh -ErrorAction SilentlyContinue) {
                gh repo create "$GitHubOrgOrUsername/$repoName" --public --source=. --remote=origin --push
            } else {
                Write-Host "GitHub CLI (gh) not found. To push to GitHub, run:" -ForegroundColor Gray
                Write-Host "  git remote add origin https://github.com/$GitHubOrgOrUsername/$repoName.git" -ForegroundColor Gray
                Write-Host "  git push -u origin main" -ForegroundColor Gray
            }
        }

        Pop-Location
    } else {
        Write-Host "Directory $svc does not exist. Skipping..." -ForegroundColor Red
    }
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " Local Git Repositories initialized for all services! " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
