const express = require('express');
const router = express.Router();
const { cca } = require('../middleware/auth');

// GET /api/auth/login - Get Azure AD login URL
router.get('/login', (req, res) => {
  try {
    const redirectUri = req.query.redirect || 'http://localhost:3000/auth/callback';
    
    const authCodeUrlParameters = {
      scopes: ['user.read'],
      redirectUri: redirectUri,
    };

    cca.getAuthCodeUrl(authCodeUrlParameters).then((authUrl) => {
      res.json({ 
        loginUrl: authUrl,
        message: 'Redirect user to this URL to sign in with Microsoft'
      });
    }).catch((error) => {
      console.error('Auth URL generation error:', error);
      res.status(500).json({ error: 'Failed to generate login URL' });
    });
  } catch (error) {
    console.error('Login route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/token - Exchange auth code for token
router.post('/token', async (req, res) => {
  try {
    const { code, redirectUri } = req.body;

    if (!code) {
      return res.status(400).json({ error: 'Authorization code required' });
    }

    const tokenRequest = {
      code: code,
      scopes: ['user.read'],
      redirectUri: redirectUri || 'http://localhost:3000/auth/callback',
    };

    const response = await cca.acquireTokenByCode(tokenRequest);
    
    res.json({
      accessToken: response.accessToken,
      expiresOn: response.expiresOn,
      account: {
        username: response.account.username,
        name: response.account.name,
        homeAccountId: response.account.homeAccountId
      }
    });
  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Failed to acquire token' });
  }
});

// GET /api/auth/me - Get current user info (requires token)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    // Decode token to get user info
    const base64Payload = token.split('.')[1];
    const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
    
    // Get admin users list
    const adminUsers = (process.env.ADMIN_USERS || '').split(',').map(e => e.trim().toLowerCase());
    const userEmail = (payload.preferred_username || payload.email || payload.upn || '').toLowerCase();
    
    res.json({
      email: userEmail,
      name: payload.name,
      isAdmin: adminUsers.includes(userEmail),
      oid: payload.oid
    });
  } catch (error) {
    console.error('User info error:', error);
    res.status(500).json({ error: 'Failed to get user information' });
  }
});

module.exports = router;
