# SubmittalAI Pro - Vercel Deployment Script
Write-Host "🚀 Deploying SubmittalAI Pro to Vercel..." -ForegroundColor Green

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Commit current changes
Write-Host "📝 Committing current changes..." -ForegroundColor Yellow
git add .
git commit -m "Add landing page and Vercel configuration for deployment"
git push

# Build the project first to verify it works
Write-Host "🔨 Building project..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Please fix build errors before deploying." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Build successful!" -ForegroundColor Green

# Deploy to Vercel
Write-Host "🚀 Deploying to Vercel..." -ForegroundColor Yellow
Write-Host "Please answer the Vercel CLI prompts as follows:" -ForegroundColor Cyan
Write-Host "  - Set up and deploy? → Y" -ForegroundColor White
Write-Host "  - Which scope? → Select your personal account" -ForegroundColor White
Write-Host "  - Link to existing project? → N" -ForegroundColor White
Write-Host "  - Project name? → submittal-ai-pro" -ForegroundColor White
Write-Host "  - Code directory? → ./" -ForegroundColor White
Write-Host ""

# Kill any hanging Vercel processes first
Get-Process -Name "vercel" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*vercel*" } | Stop-Process -Force

# Start Vercel deployment
vercel --prod

Write-Host "🎉 Deployment completed!" -ForegroundColor Green 