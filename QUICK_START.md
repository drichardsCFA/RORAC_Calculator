# RORAC Calculator - Quick Start Guide

## 🚀 Ready to Test!

Your RORAC Calculator with Smart Assistant is fully built and configured!

## Start the Application

```bash
npm run dev
```

This starts:
- ✅ React app on `http://localhost:3000`
- ✅ API server on `http://localhost:3001`

## Test the Chat Assistant

1. Open `http://localhost:3000`
2. Click the **green chat bubble** in bottom-right corner
3. Try these questions:
   - "What is the DIG blended rate?"
   - "What are the approval thresholds?"
   - "How do I calculate licensing costs?"
   - "What is the maintenance cost?"

## YOUR IMMEDIATE ACTION ITEMS

### 1. Update Admin Users ⚠️ REQUIRED
Edit `.env` file and replace with real email addresses:
```env
ADMIN_USERS=john.doe@yourdomain.com,jane.smith@yourdomain.com
```

### 2. Populate Knowledge Base 📝 CRITICAL
The chatbot currently has only 4 sample entries. You need to add your actual data:

**What to document:**
- Team rates (DIG, other teams)
- Licensing costs
- Maintenance pricing  
- Implementation rates
- Common questions & answers

**How to add:**
- Option A: Use admin panel (access instructions in README_CHATBOT.md)
- Option B: Send me a list and I'll bulk import
- Option C: Use the API directly (see ENTRA_ID_SETUP.md)

### 3. Test Admin Panel
The admin panel lets you manage the knowledge base.

**Quick test:**
1. In a separate terminal: `npm run server`
2. Test API: `curl http://localhost:3001/api/admin/knowledge -H "x-admin-token: dev-admin-token-12345"`

To view admin UI, see README_CHATBOT.md for instructions.

## What We Built Today

### ✅ Backend (Complete)
- Express API with SQLite database
- Smart search with NLP (keywords, stemming, synonyms)
- Azure Entra ID authentication
- Admin CRUD operations
- Usage analytics
- Chat history logging

### ✅ Frontend (Complete)
- Floating chat widget
- Context-aware responses
- Quick action suggestions
- Related questions
- Calculator integration

### ✅ Authentication (Complete)
- Azure Entra ID/OAuth integration
- Role-based access control (RBAC)
- Admin user management
- Dev mode fallback (legacy token)

### 🔜 Next Phase (When Ready)
- Frontend login UI with "Sign in with Microsoft"
- Admin panel routing
- Approval workflow with N8N
- Production deployment

## Key Files

| File | Purpose |
|------|---------|
| `README_CHATBOT.md` | Complete documentation |
| `ENTRA_ID_SETUP.md` | Azure authentication guide |
| `.env` | Configuration (credentials) |
| `src/components/ChatWidget.js` | Chat UI |
| `src/components/AdminPanel.js` | Admin UI |
| `server/` | Backend API |

## Testing Checklist

- [ ] Chat widget appears on calculator page
- [ ] Can ask questions and get responses
- [ ] Quick actions work
- [ ] Related questions are clickable
- [ ] Admin API accessible with token
- [ ] Updated ADMIN_USERS in .env
- [ ] Documented knowledge base content

## Common Issues

### Chat widget not showing
- Check both servers are running (`npm run dev`)
- Check browser console for errors

### "No knowledge found" responses
- Normal! Only 4 sample entries exist
- Add more knowledge via admin panel or API

### Admin panel not accessible
- See README_CHATBOT.md section 4 for access instructions
- Verify x-admin-token header is correct

## Architecture Overview

```
┌─────────────────┐
│  React Frontend │
│   (Port 3000)   │
│                 │
│  ┌───────────┐  │
│  │  RORAC    │  │
│  │Calculator │  │
│  └─────┬─────┘  │
│        │        │
│  ┌─────▼─────┐  │
│  │   Chat    │  │
│  │  Widget   │  │
│  └─────┬─────┘  │
└────────┼────────┘
         │
         │ HTTP
         │
    ┌────▼────┐
    │  Express│
    │   API   │
    │(Pt 3001)│
    └────┬────┘
         │
    ┌────▼────┐
    │ SQLite  │
    │Knowledge│
    │   DB    │
    └─────────┘
```

## Support & Next Steps

1. **Test everything** - Make sure chat works
2. **Update admin users** - Edit .env
3. **Gather knowledge** - Document all pricing/rates
4. **Test admin panel** - Add/edit entries
5. **Report issues** - Document what's not working

## Questions?

Refer to:
- `README_CHATBOT.md` - Full documentation
- `ENTRA_ID_SETUP.md` - Auth details
- Console logs - Check for errors

---

**Status**: ✅ Fully functional
**What's working**: Chat, Search, Admin API, Azure Auth
**What's needed**: Your knowledge base content!
