# RORAC Calculator with Smart Assistant

## Overview

This application combines a RORAC (Return on Risk-Adjusted Capital) calculator with an intelligent knowledge base chatbot for pricing lookups and deal information.

## What We Built

### 1. Backend API (Node.js/Express)
- **Location**: `server/`
- **Database**: SQLite (`server/db/knowledge.db`)
- **Features**:
  - Smart search algorithm with keyword matching, stemming, and synonyms
  - Knowledge base CRUD operations
  - Chat history logging
  - Usage analytics

### 2. Chat Widget
- **Location**: `src/components/ChatWidget.js`
- **Features**:
  - Conversational interface
  - Context-aware (knows current calculator values)
  - Quick action suggestions
  - Related questions
  - Minimizable floating widget

### 3. Admin Panel
- **Location**: `src/components/AdminPanel.js`
- **Access**: `http://localhost:3000/admin` (you'll need to add routing)
- **Features**:
  - Add/edit/delete knowledge entries
  - View usage analytics
  - See unmatched queries (to improve knowledge base)

## Setup & Running

### 1. Install Dependencies
Already done! Dependencies installed:
- express, cors, dotenv
- better-sqlite3 (SQLite)
- natural (NLP for keyword matching)
- concurrently (run both servers)

### 2. Start the Application

**Option A: Run both servers together (recommended)**
```bash
npm run dev
```
This runs:
- React app on `http://localhost:3000`
- API server on `http://localhost:3001`

**Option B: Run separately**
```bash
# Terminal 1 - API Server
npm run server

# Terminal 2 - React App
npm start
```

### 3. Test the Chat Assistant

1. Open `http://localhost:3000`
2. Look for the green chat bubble in bottom-right corner
3. Click to open the assistant
4. Try these questions:
   - "What is the DIG blended rate?"
   - "What are the approval thresholds?"
   - "How do I calculate licensing costs?"
   - "What is the maintenance cost?"

### 4. Access Admin Panel

Currently the admin panel is a separate component. To access it:

**Quick Option**: Create a new file `src/AdminApp.js`:
```javascript
import React from 'react';
import AdminPanel from './components/AdminPanel';

export default function AdminApp() {
  return <AdminPanel />;
}
```

Then temporarily change `src/index.js` to import AdminApp instead of App to view it.

**Better Option**: Add React Router (for next phase)

**Admin Token**: `dev-admin-token-12345` (set in `.env`)

## YOUR ACTION ITEMS

### Task 1: Azure Entra ID Setup (REQUIRED for production)
**Priority: HIGH**

1. Go to Azure Portal → Entra ID → App Registrations
2. Create new registration: "RORAC Calculator"
3. Set Redirect URIs:
   - Development: `http://localhost:3000`
   - Production: Your actual domain
4. Note these values (we'll add to `.env`):
   - **Application (client) ID**
   - **Directory (tenant) ID**
5. Under "Certificates & secrets":
   - Create a client secret
   - Save the **Secret Value**
6. Under "API permissions":
   - Add Microsoft Graph → User.Read
   - Grant admin consent
7. Under "Authentication":
   - Enable "ID tokens" and "Access tokens"

**Send me these 3 values and I'll integrate Entra ID authentication**

### Task 2: Define Admin Users
Create a list of email addresses that should have admin access. Example:
```
john.doe@yourcompany.com
jane.smith@yourcompany.com
```

### Task 3: Populate Knowledge Base
**Priority: HIGH - Critical for useful chatbot**

Gather and document:
1. **Team Rates**:
   - DIG team: $X/hour
   - Other teams and their rates
   
2. **Pricing Information**:
   - Licensing costs
   - Implementation rates
   - Maintenance costs
   - Any other pricing FAQs

3. **Common Questions**:
   - Document questions users frequently ask
   - Write clear, concise answers

**Format** (I can bulk-import):
```
Question: What is the DIG team rate?
Variants: DIG rate, How much is DIG, DIG pricing
Answer: The DIG team blended rate is $150/hour for implementation work.
Keywords: DIG, rate, pricing, team
Category: pricing
```

### Task 4: Test Different User Scenarios
1. Test as regular user (chat widget)
2. Test as admin (knowledge management)
3. Document any confusing/missing information

## API Endpoints

### Chat Endpoints (Public)
- `POST /api/chat/query` - Send a question
- `GET /api/chat/history` - Get chat history
- `GET /api/chat/suggestions` - Get quick actions

### Admin Endpoints (Protected)
- `GET /api/admin/knowledge` - List all knowledge
- `POST /api/admin/knowledge` - Create new entry
- `PUT /api/admin/knowledge/:id` - Update entry
- `DELETE /api/admin/knowledge/:id` - Delete entry
- `GET /api/admin/analytics` - Usage stats

**Authentication**: Include header `x-admin-token: dev-admin-token-12345`

## Database Schema

### knowledge table
- `id` - Auto-increment primary key
- `question_variants` - JSON array of question variations
- `answer` - The response text
- `keywords` - JSON array of keywords for matching
- `category` - Category (pricing, process, howto, general)
- `created_by` - Who created it
- `created_at` - Timestamp
- `updated_at` - Last update

### chat_history table
- `id` - Auto-increment
- `user_query` - What user asked
- `matched_question_id` - FK to knowledge table
- `response` - What bot answered
- `timestamp` - When

## How the Search Works

1. **User asks a question**: "what's the dig rate?"
2. **Keyword Extraction**: Extracts "dig", "rate" (with stemming)
3. **Synonym Expansion**: "rate" → also matches "cost", "price", "pricing"
4. **Scoring**: Each knowledge entry gets a score based on:
   - Keyword matches (10 points each)
   - Exact phrase matches (50 point bonus)
   - Partial phrase matches (5 points each)
5. **Best Match**: Returns highest scoring entry
6. **Fallback**: If no match found, suggests rephrasing

## Next Steps (Future Enhancements)

### Phase 2: Authentication
- Integrate Azure Entra ID/OAuth
- Protect admin routes
- User role management

### Phase 3: Approval Workflow
- N8N integration for deal approvals
- Email notifications
- Approval tracking

### Phase 4: Advanced Features
- Export chat transcripts
- Batch import knowledge from CSV
- Multi-language support
- Voice input

## Troubleshooting

### Chat widget not responding
1. Check API server is running: `http://localhost:3001/api/health`
2. Check browser console for errors
3. Verify CORS is enabled

### "Unauthorized" errors in admin panel
- Check `.env` file has `ADMIN_TOKEN=dev-admin-token-12345`
- Verify token matches in AdminPanel.js

### Database not seeding
- Delete `server/db/knowledge.db` and restart server
- Check console for "Database initialized" message

### React app can't reach API
- Make sure both servers are running
- Check ports (React:3000, API:3001)
- Verify API_URL in components

## Files Created/Modified

### New Files
- `server/index.js` - Express server
- `server/db/database.js` - SQLite setup
- `server/routes/chat.js` - Chat API endpoints
- `server/routes/admin.js` - Admin API endpoints
- `server/services/searchService.js` - Smart search algorithm
- `src/components/ChatWidget.js` - Chat UI
- `src/components/AdminPanel.js` - Admin UI
- `.env` - Environment variables
- `.env.example` - Template for env vars

### Modified Files
- `package.json` - Added scripts and dependencies
- `src/App.js` - Integrated ChatWidget

## Contact & Support

For issues or questions, document them and we'll address in the next session!

## License

Internal use only - CFA
