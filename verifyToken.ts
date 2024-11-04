import { Response, NextFunction } from 'express';
import { config } from './config';
import jwt from 'jsonwebtoken';
import { Request } from './customType';

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1]; 
  if (!token) {
    return res.status(401).json({ error: 'Access denied, no token provided.' });
  }
  
  try {
    const decoded = jwt.verify(token, config.jwtSecret as string);
    req.user = decoded;
    next(); 
  } catch (error) {
    // Differentiate between token expiration and invalid token
    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ error: 'Token has expired.' });
    }
    if (error instanceof jwt.JsonWebTokenError) {
      return res.status(400).json({ error: 'Invalid token.' });
    }
    // Handle other errors if needed
    return res.status(500).json({ error: 'Something went wrong.' });
  }
};

export default verifyToken;
