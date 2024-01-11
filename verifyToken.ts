import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { Request } from './customType';

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers['authorization']?.split(' ')[1]; 
  if (!token) {
    return res.status(401).json({ error: 'Access denied, no token provided.' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string);
    req.user = decoded;
    next(); 
  } catch (error) {
    res.status(400).json({ error: 'Invalid token.' });
  }
};

export default verifyToken;
