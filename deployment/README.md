# RORAC Calculator - Deployment Guide

## Quick Start

To deploy the RORAC Calculator to Azure for UAT/staging:

1. **Run the deployment checker:**
   ```powershell
   .\deployment\deploy-to-azure.ps1
   ```

2. **Follow the comprehensive guide:**
   Open `AZURE_DEPLOYMENT_GUIDE.md` and follow each step carefully.

## What's Included

### Deployment Files
- `AZURE_DEPLOYMENT_GUIDE.md` - Complete step-by-step Azure deployment instructions
- `deploy-to-azure.ps1` - Prerequisite checker script
- `nginx.conf` - Frontend web server configuration

### Docker Files (in project root)
- `Dockerfile.api` - Node.js API service
- `Dockerfile.pdf` - Python PDF generation service
- `Dockerfile.frontend` - React frontend application

### Configuration Files
- `.env.production` - Production environment variables for React

## Deployment Summary

The application will be deployed as three separate Azure Web Apps:

1. **Frontend** (React App)
   - Serves the calculator interface
   - Built with nginx
   - Port 80 (HTTPS in Azure)

2. **API Service** (Node.js)
   - Handles data storage
   - Manages chat/assistant
   - Admin panel backend
   - Port 3002

3. **PDF Service** (Python/Flask)
   - Generates professional PDF reports
   - Port 5001

## Prerequisites

Before starting:
- ✅ Azure subscription
- ✅ Azure CLI installed
- ✅ Docker Desktop installed
- ✅ Access to Azure AD app registration (for updating redirect URIs)

## Time Estimate

- **First-time deployment**: 60-75 minutes
- **Subsequent deployments**: 15-20 minutes (just rebuild and push images)

## Cost

With Basic (B1) tier App Service Plan:
- **~$39/month** for all three services
- Includes SSL certificates
- Can be stopped when not in use to save costs

## Architecture

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│  React Frontend │ ← nginx serving static files
│  (Port 80)      │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌─────────┐ ┌──────────┐
│ Node.js │ │  Python  │
│   API   │ │   PDF    │
│ (3002)  │ │ Service  │
│         │ │  (5001)  │
└─────────┘ └──────────┘
    │
    ▼
┌─────────┐
│ SQLite  │
│   DB    │
└─────────┘
```

## After Deployment

Your team can access:
- **Calculator**: `https://rorac-frontend-XXXX.azurewebsites.net`
- **Admin Panel**: `https://rorac-frontend-XXXX.azurewebsites.net/admin`
- **API**: `https://rorac-api-XXXX.azurewebsites.net`

## Support

If you encounter issues:
1. Check the Troubleshooting section in `AZURE_DEPLOYMENT_GUIDE.md`
2. View logs in Azure Portal
3. Use the `az webapp log tail` command to see real-time logs

## Next Steps

After successful deployment:
- ✅ Test all features with your team
- ✅ Set up custom domain (optional)
- ✅ Configure Application Insights for monitoring
- ✅ Set up CI/CD pipeline for automated deployments
