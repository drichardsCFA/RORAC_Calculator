# Azure Deployment Guide - RORAC Calculator

This guide will walk you through deploying the RORAC Calculator to Azure for staging/UAT.

## Prerequisites

✅ Azure subscription (if you don't have one, create a free account at https://azure.microsoft.com/free/)  
✅ Azure CLI installed (https://docs.microsoft.com/cli/azure/install-azure-cli)  
✅ Docker Desktop installed (https://www.docker.com/products/docker-desktop/)

---

## Part 1: Initial Setup (10 minutes)

### Step 1: Install Azure CLI

1. Download from: https://aka.ms/installazurecliwindows
2. Run the installer
3. Open a **new** PowerShell terminal
4. Verify installation:
   ```powershell
   az --version
   ```

### Step 2: Login to Azure

```powershell
az login
```

This will open your browser. Sign in with your Azure account.

### Step 3: Choose Your Subscription

List your subscriptions:
```powershell
az account list --output table
```

Set the one you want to use:
```powershell
az account set --subscription "YOUR_SUBSCRIPTION_NAME_OR_ID"
```

---

## Part 2: Create Azure Resources (15 minutes)

### Step 4: Create Resource Group

```powershell
# Replace with your preferred location (e.g., "eastus", "westus2", "centralus")
$LOCATION = "eastus"
$RESOURCE_GROUP = "rorac-calculator-staging"

az group create --name $RESOURCE_GROUP --location $LOCATION
```

### Step 5: Create Azure Container Registry (ACR)

This will store your Docker images.

```powershell
# Choose a unique name (only lowercase letters and numbers, must be globally unique)
$ACR_NAME = "roracregistry$(Get-Random -Minimum 1000 -Maximum 9999)"

az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true

# Get the registry login server
$ACR_LOGIN_SERVER = az acr show --name $ACR_NAME --query loginServer --output tsv
Write-Host "ACR Login Server: $ACR_LOGIN_SERVER"

# Get admin credentials
$ACR_USERNAME = az acr credential show --name $ACR_NAME --query username --output tsv
$ACR_PASSWORD = az acr credential show --name $ACR_NAME --query "passwords[0].value" --output tsv

Write-Host "ACR Username: $ACR_USERNAME"
Write-Host "ACR Password: $ACR_PASSWORD"
```

**IMPORTANT:** Save these values - you'll need them later!

### Step 6: Create App Service Plan

This defines the computing resources.

```powershell
$APP_SERVICE_PLAN = "rorac-plan"

az appservice plan create `
  --name $APP_SERVICE_PLAN `
  --resource-group $RESOURCE_GROUP `
  --is-linux `
  --sku B1
```

---

## Part 3: Build and Push Docker Images (20 minutes)

### Step 7: Login to Docker and ACR

```powershell
# Login to Azure Container Registry
az acr login --name $ACR_NAME

# Also login Docker
docker login $ACR_LOGIN_SERVER -u $ACR_USERNAME -p $ACR_PASSWORD
```

### Step 8: Build and Push API Service

```powershell
cd F:\RORAC_Calculator

# Build the image
docker build -t $ACR_LOGIN_SERVER/rorac-api:latest -f Dockerfile.api .

# Push to registry
docker push $ACR_LOGIN_SERVER/rorac-api:latest
```

### Step 9: Build and Push PDF Service

```powershell
# Build the image
docker build -t $ACR_LOGIN_SERVER/rorac-pdf:latest -f Dockerfile.pdf .

# Push to registry
docker push $ACR_LOGIN_SERVER/rorac-pdf:latest
```

### Step 10: Build and Push Frontend

**BEFORE building**, update `.env.production` with the URLs you'll create in the next steps.

For now, use placeholders - we'll update them later:

```powershell
# Build the image
docker build -t $ACR_LOGIN_SERVER/rorac-frontend:latest -f Dockerfile.frontend .

# Push to registry
docker push $ACR_LOGIN_SERVER/rorac-frontend:latest
```

---

## Part 4: Deploy Services (15 minutes)

### Step 11: Deploy API Service

```powershell
$API_APP_NAME = "rorac-api-$(Get-Random -Minimum 1000 -Maximum 9999)"

az webapp create `
  --resource-group $RESOURCE_GROUP `
  --plan $APP_SERVICE_PLAN `
  --name $API_APP_NAME `
  --deployment-container-image-name "$ACR_LOGIN_SERVER/rorac-api:latest"

# Configure ACR credentials
az webapp config container set `
  --name $API_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --docker-custom-image-name "$ACR_LOGIN_SERVER/rorac-api:latest" `
  --docker-registry-server-url "https://$ACR_LOGIN_SERVER" `
  --docker-registry-server-user $ACR_USERNAME `
  --docker-registry-server-password $ACR_PASSWORD

# Set environment variables
az webapp config appsettings set `
  --name $API_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --settings `
    AZURE_CLIENT_ID="b5984339-5de5-4eef-9a7f-77c2e679133e" `
    AZURE_CLIENT_SECRET="0a39fad3-b731-4218-829d-061752c39e63" `
    AZURE_TENANT_ID="1f2e6436-f7ed-407f-9da6-e39d0e370329" `
    ADMIN_USERS="drichards@cfafs.com,jjmorris@cfafs.com,kdbecker@cfafs.com,sdhoefer@cfafs.com,jafunk@cfafs.com" `
    ADMIN_TOKEN="dev-admin-token-12345" `
    NODE_ENV="production" `
    API_PORT="3002"

# Get the API URL
$API_URL = "https://$API_APP_NAME.azurewebsites.net"
Write-Host "API URL: $API_URL"
```

### Step 12: Deploy PDF Service

```powershell
$PDF_APP_NAME = "rorac-pdf-$(Get-Random -Minimum 1000 -Maximum 9999)"

az webapp create `
  --resource-group $RESOURCE_GROUP `
  --plan $APP_SERVICE_PLAN `
  --name $PDF_APP_NAME `
  --deployment-container-image-name "$ACR_LOGIN_SERVER/rorac-pdf:latest"

# Configure ACR credentials
az webapp config container set `
  --name $PDF_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --docker-custom-image-name "$ACR_LOGIN_SERVER/rorac-pdf:latest" `
  --docker-registry-server-url "https://$ACR_LOGIN_SERVER" `
  --docker-registry-server-user $ACR_USERNAME `
  --docker-registry-server-password $ACR_PASSWORD

# Set environment variables
az webapp config appsettings set `
  --name $PDF_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --settings PDF_SERVICE_PORT="5001"

# Get the PDF service URL
$PDF_URL = "https://$PDF_APP_NAME.azurewebsites.net"
Write-Host "PDF Service URL: $PDF_URL"
```

### Step 13: Update Frontend Environment and Rebuild

Now that you have the actual URLs, update `.env.production`:

```env
REACT_APP_API_URL=https://your-actual-api-name.azurewebsites.net
REACT_APP_PDF_SERVICE_URL=https://your-actual-pdf-name.azurewebsites.net
```

Replace with the URLs from Steps 11 and 12, then rebuild and push:

```powershell
# Rebuild with correct URLs
docker build -t $ACR_LOGIN_SERVER/rorac-frontend:latest -f Dockerfile.frontend .
docker push $ACR_LOGIN_SERVER/rorac-frontend:latest
```

### Step 14: Deploy Frontend

```powershell
$FRONTEND_APP_NAME = "rorac-frontend-$(Get-Random -Minimum 1000 -Maximum 9999)"

az webapp create `
  --resource-group $RESOURCE_GROUP `
  --plan $APP_SERVICE_PLAN `
  --name $FRONTEND_APP_NAME `
  --deployment-container-image-name "$ACR_LOGIN_SERVER/rorac-frontend:latest"

# Configure ACR credentials
az webapp config container set `
  --name $FRONTEND_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --docker-custom-image-name "$ACR_LOGIN_SERVER/rorac-frontend:latest" `
  --docker-registry-server-url "https://$ACR_LOGIN_SERVER" `
  --docker-registry-server-user $ACR_USERNAME `
  --docker-registry-server-password $ACR_PASSWORD

# Get the frontend URL
$FRONTEND_URL = "https://$FRONTEND_APP_NAME.azurewebsites.net"
Write-Host "Frontend URL: $FRONTEND_URL"
```

---

## Part 5: Configure Azure AD (10 minutes)

### Step 15: Update Azure AD App Registration

1. Go to https://portal.azure.com
2. Search for "Azure Active Directory" in the top search bar
3. Click "App registrations" in the left menu
4. Find your app (the one with Client ID: b5984339-5de5-4eef-9a7f-77c2e679133e)
5. Click on it
6. Click "Authentication" in the left menu
7. Under "Web" → "Redirect URIs", add:
   - `https://your-frontend-app-name.azurewebsites.net`
   - `https://your-api-app-name.azurewebsites.net`
8. Click "Save" at the top

---

## Part 6: Enable CORS (5 minutes)

### Step 16: Configure CORS for API

```powershell
az webapp cors add `
  --name $API_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --allowed-origins "https://$FRONTEND_APP_NAME.azurewebsites.net"
```

### Step 17: Configure CORS for PDF Service

```powershell
az webapp cors add `
  --name $PDF_APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --allowed-origins "https://$FRONTEND_APP_NAME.azurewebsites.net"
```

---

## Part 7: Test Your Deployment (5 minutes)

### Step 18: Access Your Application

1. Open your browser
2. Go to: `https://your-frontend-app-name.azurewebsites.net`
3. The RORAC Calculator should load!

### Step 19: Test Key Features

- ✅ Calculator loads
- ✅ Can input loan details
- ✅ Can save deals
- ✅ Export to PDF works
- ✅ Chat assistant responds
- ✅ Admin panel accessible at `/admin`

---

## Part 8: Share with Team

### Step 20: Get Your URLs

```powershell
Write-Host "===================================="
Write-Host "RORAC Calculator Staging URLs"
Write-Host "===================================="
Write-Host "Frontend: https://$FRONTEND_APP_NAME.azurewebsites.net"
Write-Host "Admin Panel: https://$FRONTEND_APP_NAME.azurewebsites.net/admin"
Write-Host "API: https://$API_APP_NAME.azurewebsites.net"
Write-Host "PDF Service: https://$PDF_APP_NAME.azurewebsites.net"
Write-Host "===================================="
```

Share the Frontend URL with your team!

---

## Troubleshooting

### Services Not Starting?

Check logs:
```powershell
# API logs
az webapp log tail --name $API_APP_NAME --resource-group $RESOURCE_GROUP

# PDF service logs
az webapp log tail --name $PDF_APP_NAME --resource-group $RESOURCE_GROUP

# Frontend logs
az webapp log tail --name $FRONTEND_APP_NAME --resource-group $RESOURCE_GROUP
```

### Need to Redeploy?

Just rebuild and push the image:
```powershell
docker build -t $ACR_LOGIN_SERVER/rorac-api:latest -f Dockerfile.api .
docker push $ACR_LOGIN_SERVER/rorac-api:latest

# Restart the app
az webapp restart --name $API_APP_NAME --resource-group $RESOURCE_GROUP
```

### Delete Everything?

```powershell
az group delete --name $RESOURCE_GROUP --yes --no-wait
```

---

## Cost Estimate

With B1 App Service Plan (Basic tier):
- **~$13/month per service** = $39/month total for staging
- Includes SSL certificates
- 1.75 GB RAM per service

You can stop services when not in use:
```powershell
az webapp stop --name $API_APP_NAME --resource-group $RESOURCE_GROUP
az webapp stop --name $PDF_APP_NAME --resource-group $RESOURCE_GROUP
az webapp stop --name $FRONTEND_APP_NAME --resource-group $RESOURCE_GROUP
```

---

## Next Steps

- ✅ Monitor application performance in Azure Portal
- ✅ Set up custom domain (optional)
- ✅ Configure Application Insights for monitoring
- ✅ Set up automated backups
- ✅ Create CI/CD pipeline for automatic deployments

Need help? Check Azure Portal → Resource Group → Click on each service for detailed info!
