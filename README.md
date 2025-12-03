# RORAC Calculator with Smart Assistant

A sophisticated Return on Risk-Adjusted Capital (RORAC) calculator with an integrated AI-powered knowledge base assistant for financial decision-making.

![License](https://img.shields.io/badge/license-Proprietary-blue)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![React](https://img.shields.io/badge/react-19.2.0-61dafb)

## 🎯 Overview

The RORAC Calculator is designed for business development teams to quickly estimate costs for implementing and onboarding new clients or expanding existing relationships. It features:

- **Deal Calculator**: Comprehensive cost estimation for loans and implementations
- **PDF Export**: Professional business reports for client meetings
- **Fee Management**: Track credit pulls, UCC filings, and modification fees
- **Smart Assistant**: AI-powered chatbot for instant pricing and process information
- **Knowledge Base**: Searchable repository of team rates, pricing, and FAQs
- **Admin Panel**: Easy management of knowledge base entries
- **Analytics**: Track usage and improve responses over time
- **Azure Integration**: Enterprise-grade authentication with Microsoft Entra ID
- **Cloud Ready**: Docker containers for Azure deployment

## ✨ Key Features

### RORAC Calculator
- Loan amount and terms calculation
- **Fee management**: Credit pull fees, UCC costs, modification fees
- Licensing cost estimation (base + per-user)
- Implementation resource planning (internal + vendor)
- Maintenance cost projections
- Custom development estimates (config, code, database, API)
- Automatic approval threshold detection (COO/CEO)
- Deal comparison and export (CSV)
- **PDF export**: Professional business reports
- Deal save/load functionality (browser storage)

### Smart Assistant
- Natural language question processing
- Keyword matching with stemming and synonyms
- Context-aware responses (knows your current deal)
- Related question suggestions
- Quick action buttons
- Chat history logging
- Handles typos and variations

### Admin Features
- CRUD operations for knowledge base
- Usage analytics dashboard
- Unmatched query tracking (improve KB coverage)
- Role-based access control (RBAC)
- Azure Entra ID authentication

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.11+ (for PDF service)
- Git
- Azure Entra ID tenant (for auth)
- Docker Desktop (optional, for deployment)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/dougrichards13/RORAC_Calculator.git
cd RORAC_Calculator
```

2. **Install dependencies**
```bash
npm install
cd pdf_service
pip install -r requirements.txt
cd ..
```

3. **Configure environment**
```bash
# Copy example environment file
cp .env.example .env

# Edit .env and add your credentials
# AZURE_CLIENT_ID=your-client-id
# AZURE_TENANT_ID=your-tenant-id
# AZURE_CLIENT_SECRET=your-secret
# ADMIN_USERS=admin@yourdomain.com
```

4. **Start the application**
```bash
# Option 1: Automated (Windows)
start.bat

# Option 2: Manual
npm run dev
```

This runs all three services:
- React frontend (port 3000)
- Node.js API server (port 3002)
- Python PDF service (port 5001)

5. **Open in browser**
```
http://localhost:3000
```

## 📚 Documentation

- **[Quick Start Guide](QUICK_START_GUIDE.md)** - Get up and running fast
- **[Complete Documentation](README_CHATBOT.md)** - Full feature guide
- **[Azure Deployment Guide](deployment/AZURE_DEPLOYMENT_GUIDE.md)** - Deploy to Azure staging
- **[PDF Service Docs](pdf_service/README.md)** - PDF generation service
- **[API Reference](#api-endpoints)** - Backend API documentation

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│          React Frontend                 │
│         (Port 3000/5000)                │
│                                         │
│  ┌──────────────┐  ┌─────────────┐    │
│  │   RORAC      │  │   Chat      │    │
│  │  Calculator  │  │   Widget    │    │
│  └──────┬───────┘  └──────┬──────┘    │
└─────────┼──────────────────┼───────────┘
          │                  │
          │    HTTP/JSON     │
          │                  │
┌─────────▼──────────────────▼───────────┐
│        Express.js API Server            │
│           (Port 3002)                   │
│                                         │
│  ┌──────────┐  ┌──────────────────┐   │
│  │  Auth    │  │  Smart Search    │   │
│  │Middleware│  │  (NLP Engine)    │   │
│  └──────────┘  └──────────────────┘   │
└─────────┬───────────────┬───────────────┘
          │               │
          │          ┌────▼─────────────┐
          │          │  Python/Flask    │
          │          │  PDF Service     │
          │          │  (Port 5001)     │
          │          └──────────────────┘
┌─────────▼───────────┐
│  SQLite Database    │
│  - Knowledge Base   │
│  - Chat History     │
│  - Saved Deals      │
└─────────────────────┘
```

## 🛠️ Technology Stack

### Frontend
- **React 19.2** - UI framework
- **Tailwind CSS 3.4** - Styling
- **Lucide React** - Icons
- **React Router 7** - Routing

### Backend
- **Express 5** - Web framework
- **SQLite (better-sqlite3)** - Database
- **Natural** - NLP library
- **MSAL Node** - Azure authentication
- **Python 3.11 + Flask** - PDF generation service
- **ReportLab** - PDF creation library

### DevOps
- **Docker** - Containerization
- **Azure App Service** - Cloud hosting
- **Concurrently** - Run multiple servers
- **dotenv** - Environment configuration

## 📡 API Endpoints

### Public Endpoints
```
POST   /api/chat/query          # Ask the assistant a question
GET    /api/chat/history         # Get chat history
GET    /api/chat/suggestions     # Get quick action suggestions
```

### Auth Endpoints
```
GET    /api/auth/login           # Get Azure AD login URL
POST   /api/auth/token           # Exchange auth code for token
GET    /api/auth/me              # Get current user info
```

### Admin Endpoints (Protected)
```
GET    /api/admin/knowledge      # List all knowledge entries
POST   /api/admin/knowledge      # Create new entry
PUT    /api/admin/knowledge/:id  # Update entry
DELETE /api/admin/knowledge/:id  # Delete entry
GET    /api/admin/analytics      # Get usage statistics
```

## 🔐 Security

- **Azure Entra ID**: Enterprise SSO authentication
- **RBAC**: Role-based admin access
- **Environment Variables**: Secrets never committed
- **Input Validation**: SQL injection prevention
- **CORS**: Configured for your domain
- **Git Hooks**: Secret scanning enabled

## 🧪 Testing

```bash
# Run API tests
npm run server
node test-api.js

# Test chatbot
# 1. Start app: npm run dev
# 2. Open http://localhost:3000
# 3. Click green chat bubble
# 4. Ask: "What is the DIG blended rate?"
```

## 📦 Deployment

### Development
```bash
# Windows - One-click launch
start.bat

# Or manually
npm run dev
```

### Staging/Production (Azure)
See the comprehensive **[Azure Deployment Guide](deployment/AZURE_DEPLOYMENT_GUIDE.md)** for step-by-step instructions.

**Quick summary:**
1. Build Docker images
2. Push to Azure Container Registry
3. Deploy to Azure App Services
4. Configure environment variables
5. Update Azure AD redirect URIs

**Estimated time:** 60-75 minutes for first deployment

**Services deployed:**
- Frontend (React + nginx)
- API (Node.js + Express)
- PDF Service (Python + Flask)

## 🤝 Contributing

This is a proprietary internal application. For access or contributions:

1. Contact the repository owner
2. Get added to approved users list
3. Follow internal development guidelines

## 📝 License

Proprietary - Internal use only. All rights reserved.

## 👥 Team

- **Development**: Built in partnership with AI assistance
- **Organization**: Cooperative Finance Association (CFAi)
- **Maintained by**: [Doug Richards](https://github.com/dougrichards13)

## 🐛 Known Issues

- Admin panel uses legacy token for development (Azure AD configured for production)
- Browser-based storage (saved deals stored locally)
- N8N approval workflow integration planned

## 🗺️ Roadmap

### Phase 1: MVP ✅ Complete
- [x] RORAC calculator
- [x] Fee management (credit pulls, UCC, modifications)
- [x] Smart chatbot
- [x] Admin panel
- [x] Azure authentication (backend)
- [x] Knowledge base
- [x] PDF export service
- [x] Docker containerization
- [x] Azure deployment ready

### Phase 2: Production Deployment 🔄 In Progress
- [x] PDF generation service
- [x] Azure deployment guide
- [x] Docker containers
- [ ] Deploy to staging environment
- [ ] User acceptance testing
- [ ] Frontend "Sign in with Microsoft" button
- [ ] Token refresh handling

### Phase 3: Workflow Integration
- [ ] N8N approval automation
- [ ] Email notifications
- [ ] Deal approval tracking
- [ ] Audit logging

### Phase 4: Production Ready
- [ ] Production deployment
- [ ] Monitoring & alerts
- [ ] Backup automation
- [ ] Performance optimization

## 📞 Support

For issues, questions, or access requests:
- Create an issue in this repository
- Contact: doug.richards@smartfactory.com
- Internal docs: See documentation files

---

**Built with ❤️ for smarter financial decision-making**
