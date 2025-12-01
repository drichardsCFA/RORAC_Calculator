# RORAC Calculator with Smart Assistant

A sophisticated Return on Risk-Adjusted Capital (RORAC) calculator with an integrated AI-powered knowledge base assistant for financial decision-making.

![License](https://img.shields.io/badge/license-Proprietary-blue)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![React](https://img.shields.io/badge/react-19.2.0-61dafb)

## 🎯 Overview

The RORAC Calculator is designed for business development teams to quickly estimate costs for implementing and onboarding new clients or expanding existing relationships. It features:

- **Deal Calculator**: Comprehensive cost estimation for loans and implementations
- **Smart Assistant**: AI-powered chatbot for instant pricing and process information
- **Knowledge Base**: Searchable repository of team rates, pricing, and FAQs
- **Admin Panel**: Easy management of knowledge base entries
- **Analytics**: Track usage and improve responses over time
- **Azure Integration**: Enterprise-grade authentication with Microsoft Entra ID

## ✨ Key Features

### RORAC Calculator
- Loan amount and terms calculation
- Licensing cost estimation (base + per-user)
- Implementation resource planning (internal + vendor)
- Maintenance cost projections
- Custom development estimates (config, code, database, API)
- Automatic approval threshold detection (COO/CEO)
- Deal comparison and export (CSV/JSON)
- Deal save/load functionality

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
- Git
- Azure Entra ID tenant (for auth)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/dougrichards13/RORAC_Calculator.git
cd RORAC_Calculator
```

2. **Install dependencies**
```bash
npm install
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
npm run dev
```

This runs both the React frontend (port 3000) and API server (port 3001).

5. **Open in browser**
```
http://localhost:3000
```

## 📚 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get up and running fast
- **[Complete Documentation](README_CHATBOT.md)** - Full feature guide
- **[Azure Setup](ENTRA_ID_SETUP.md)** - Authentication configuration
- **[API Reference](#api-endpoints)** - Backend API documentation

## 🏗️ Architecture

```
┌─────────────────────────────────────────┐
│          React Frontend                 │
│         (Port 3000)                     │
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
│           (Port 3001)                   │
│                                         │
│  ┌──────────┐  ┌──────────────────┐   │
│  │  Auth    │  │  Smart Search    │   │
│  │Middleware│  │  (NLP Engine)    │   │
│  └──────────┘  └──────────────────┘   │
└─────────┬───────────────────────────────┘
          │
┌─────────▼───────────┐
│  SQLite Database    │
│  - Knowledge Base   │
│  - Chat History     │
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

### DevOps
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
npm run dev
```

### Production
```bash
# Build React app
npm run build

# Start API server
NODE_ENV=production npm run server

# Serve React build with your web server (nginx, etc.)
```

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

- Admin panel requires legacy token in development mode
- Frontend Azure login UI pending (Phase 2)
- N8N approval workflow integration planned

## 🗺️ Roadmap

### Phase 1: MVP ✅ Complete
- [x] RORAC calculator
- [x] Smart chatbot
- [x] Admin panel
- [x] Azure authentication (backend)
- [x] Knowledge base

### Phase 2: Enhanced Auth 🔄 In Progress
- [ ] Frontend "Sign in with Microsoft" button
- [ ] Token refresh handling
- [ ] Protected routes in React
- [ ] User profile display

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
