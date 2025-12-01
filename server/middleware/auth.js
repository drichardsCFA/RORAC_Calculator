const { ConfidentialClientApplication } = require('@azure/msal-node');

// MSAL Configuration
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}`,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
  }
};

const cca = new ConfidentialClientApplication(msalConfig);

// Parse admin users from env
const getAdminUsers = () => {
  const adminUsers = process.env.ADMIN_USERS || '';
  return adminUsers.split(',').map(email => email.trim().toLowerCase()).filter(Boolean);
};

// Middleware to verify Azure AD token
async function verifyAzureToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);

    // For development: Accept simple admin token
    if (token === process.env.ADMIN_TOKEN && process.env.NODE_ENV !== 'production') {
      console.log('⚠️  Using dev admin token (disable in production)');
      req.user = { email: 'dev-admin@local', isAdmin: true };
      return next();
    }

    // Validate Azure AD token
    // Note: In production, you'd validate the token signature and claims
    // For now, we'll do basic validation
    try {
      // Decode JWT token (basic parsing)
      const base64Payload = token.split('.')[1];
      const payload = JSON.parse(Buffer.from(base64Payload, 'base64').toString());
      
      req.user = {
        email: payload.preferred_username || payload.email || payload.upn,
        name: payload.name,
        oid: payload.oid,
        isAdmin: false
      };

      // Check if user is admin
      const adminUsers = getAdminUsers();
      if (adminUsers.includes(req.user.email.toLowerCase())) {
        req.user.isAdmin = true;
      }

      next();
    } catch (decodeError) {
      console.error('Token decode error:', decodeError);
      return res.status(401).json({ error: 'Invalid token format' });
    }

  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

// Middleware to require admin role
function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({ 
      error: 'Admin access required',
      message: 'Contact your administrator to request admin access'
    });
  }

  next();
}

// Simple auth for development (legacy support)
function legacyAuth(req, res, next) {
  const adminToken = req.headers['x-admin-token'];
  
  if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
    return res.status(403).json({ error: 'Unauthorized' });
  }
  
  req.user = { email: 'dev-admin@local', isAdmin: true };
  next();
}

module.exports = {
  verifyAzureToken,
  requireAdmin,
  legacyAuth,
  cca
};
