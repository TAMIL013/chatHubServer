import admin from '../services/firebaseAuth.js';

export const authMiddleware = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    
    // Verify the token
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Add user email to request object
    res.user = {
      email: decodedToken.email
    };
    
    next();
  } catch (error) {
    console.error('Error validating Firebase token:', error);
    return res.status(401).json({ error: 'Invalid token' });
  }
}; 