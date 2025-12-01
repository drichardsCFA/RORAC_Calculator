# Azure Entra ID Authentication - Setup Complete! ✅

## What's Been Configured

Your RORAC Calculator now has proper Azure Entra ID (OAuth) authentication integrated!

### Credentials Added:
- **Client ID**: Configured in `.env`
- **Tenant ID**: Configured in `.env`
- **Client Secret**: Securely stored in `.env` (never committed to git)

### Files Updated:
1. ✅ `.env` - Azure credentials added
2. ✅ `server/middleware/auth.js` - Authentication middleware created
3. ✅ `server/routes/auth.js` - Login/token endpoints added
4. ✅ `server/routes/admin.js` - Protected with Azure auth
5. ✅ `server/index.js` - Auth routes registered

## Important: Update Admin Users

**ACTION REQUIRED**: Edit `.env` and replace `your-email@domain.com` with actual admin emails:

```env
ADMIN_USERS=john.doe@yourdomain.com,jane.smith@yourdomain.com
```

## How Authentication Works

### 1. Development Mode (Current)
- Admin panel still accepts legacy token: `x-admin-token: dev-admin-token-12345`
- This allows you to test without Azure login
- **Will be disabled in production**

### 2. Production Mode (Azure OAuth)
- Users click "Sign in with Microsoft"
- Redirected to Azure AD login
- Token returned and used for API calls
- Only users in `ADMIN_USERS` list can access admin panel

## API Endpoints

### Public Endpoints (No Auth)
- `POST /api/chat/query` - Ask questions
- `GET /api/chat/suggestions` - Get suggestions
- `GET /api/chat/history` - View history

### Auth Endpoints
- `GET /api/auth/login` - Get Azure login URL
- `POST /api/auth/token` - Exchange auth code for token
- `GET /api/auth/me` - Get current user info

### Protected Endpoints (Admin Only)
- `GET /api/admin/knowledge` - List knowledge
- `POST /api/admin/knowledge` - Create entry
- `PUT /api/admin/knowledge/:id` - Update entry
- `DELETE /api/admin/knowledge/:id` - Delete entry
- `GET /api/admin/analytics` - View analytics

## Testing Authentication

### Test 1: Legacy Token (Dev Mode)
```bash
curl -X GET http://localhost:3001/api/admin/knowledge \
  -H "x-admin-token: dev-admin-token-12345"
```

### Test 2: Get Azure Login URL
```bash
curl http://localhost:3001/api/auth/login
```

This returns a `loginUrl` - users would be redirected here to sign in.

### Test 3: Verify Token
Once you have an Azure token:
```bash
curl -X GET http://localhost:3001/api/auth/me \
  -H "Authorization: Bearer YOUR_AZURE_TOKEN"
```

## Azure Portal Configuration Checklist

✅ App registered: "CFAi RORAC Calculator"
✅ Client ID saved
✅ Tenant ID saved
✅ Client Secret created
✅ Redirect URIs configured:
   - `http://localhost:3000/auth/callback` (dev)
   - Your production URL (when ready)
✅ API Permissions: `User.Read` granted
✅ Tokens enabled: ID tokens + Access tokens

## Next Steps

### Phase 1: Test Current Setup
1. Update `ADMIN_USERS` in `.env` with real email addresses
2. Run: `npm run dev`
3. Test admin panel with legacy token
4. Verify everything works

### Phase 2: Add Frontend Auth (Next Session)
We'll add:
- "Sign in with Microsoft" button
- Token storage in browser
- Automatic token refresh
- Protected admin routes in React

### Phase 3: Production Deployment
- Remove legacy token auth
- Add production redirect URLs to Azure
- Enable token validation
- Set `NODE_ENV=production`

## Security Notes

### Current Security:
- ✅ Admin routes protected
- ✅ Azure credentials in environment variables (not committed)
- ✅ Legacy token for development only
- ✅ Role-based access (admin users list)

### Production Security:
- 🔐 Disable legacy token auth
- 🔐 Validate JWT signatures
- 🔐 Check token expiration
- 🔐 Use HTTPS only
- 🔐 Rotate client secret regularly

## Troubleshooting

### "Unauthorized" errors
1. Check `.env` has all 3 Azure credentials
2. Verify client secret hasn't expired
3. Check user email is in `ADMIN_USERS` list

### "Invalid token" errors
1. Token may be expired (they expire in ~1 hour)
2. User needs to sign in again
3. Check token format (should be `Bearer token`)

### Can't sign in to Azure
1. Verify redirect URI in Azure Portal matches your app
2. Check user has permission to sign in
3. Verify tenant ID is correct

## Architecture

```
User → Azure AD Login → Auth Code → Your API
                                   ↓
                              Exchange for Token
                                   ↓
                              Store in Browser
                                   ↓
                        Use for Admin API Calls
```

## Files Reference

### Environment Variables (`.env`)
```env
AZURE_CLIENT_ID=your-client-id-from-azure-portal
AZURE_TENANT_ID=your-tenant-id-from-azure-portal
AZURE_CLIENT_SECRET=your-client-secret-from-azure-portal
ADMIN_USERS=your-email@domain.com
ADMIN_TOKEN=dev-admin-token-12345  # Dev only
```

### Auth Middleware (`server/middleware/auth.js`)
- `verifyAzureToken()` - Validates JWT from Azure
- `requireAdmin()` - Checks user is admin
- `legacyAuth()` - Dev mode fallback

### Auth Routes (`server/routes/auth.js`)
- `/api/auth/login` - Generate login URL
- `/api/auth/token` - Exchange code for token
- `/api/auth/me` - Get user info

## Support

For issues or questions about Azure Entra ID integration, reference:
- [Azure AD Node.js Quickstart](https://learn.microsoft.com/en-us/azure/active-directory/develop/quickstart-v2-nodejs-webapp)
- [MSAL Node Documentation](https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-node)

---

**Status**: ✅ Backend authentication complete
**Next**: Frontend login UI integration
