# RORAC Calculator - Azure Deployment Script
# This script automates the deployment process

Write-Host "=====================================" -ForegroundColor Green
Write-Host "  RORAC Calculator - Azure Deployment" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green
Write-Host ""

# Check prerequisites
Write-Host "Checking prerequisites..." -ForegroundColor Yellow

# Check Azure CLI
try {
    az --version | Out-Null
    Write-Host "✓ Azure CLI installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Azure CLI not found. Please install from: https://aka.ms/installazurecliwindows" -ForegroundColor Red
    exit 1
}

# Check Docker
try {
    docker --version | Out-Null
    Write-Host "✓ Docker installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker not found. Please install from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "All prerequisites met!" -ForegroundColor Green
Write-Host ""
Write-Host "Please open the AZURE_DEPLOYMENT_GUIDE.md file and follow the steps." -ForegroundColor Cyan
Write-Host ""
Write-Host "The guide includes:" -ForegroundColor Cyan
Write-Host "  • Step-by-step instructions" -ForegroundColor White
Write-Host "  • Copy-paste commands" -ForegroundColor White
Write-Host "  • Troubleshooting tips" -ForegroundColor White
Write-Host ""
Write-Host "Location: .\deployment\AZURE_DEPLOYMENT_GUIDE.md" -ForegroundColor Yellow
Write-Host ""
Write-Host "Estimated time: 60-75 minutes" -ForegroundColor White
Write-Host ""

$open = Read-Host "Open the guide now? (Y/N)"
if ($open -eq "Y" -or $open -eq "y") {
    Start-Process ".\deployment\AZURE_DEPLOYMENT_GUIDE.md"
}
