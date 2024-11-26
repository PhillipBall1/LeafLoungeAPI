"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Access denied, no token provided.' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, "RejfFLso93nFL6sP20382KEYkf89d0");
        req.user = decoded;
        next();
    }
    catch (error) {
        // Differentiate between token expiration and invalid token
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            return res.status(401).json({ error: 'Token has expired.' });
        }
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            return res.status(400).json({ error: 'Invalid token.' });
        }
        // Handle other errors if needed
        return res.status(500).json({ error: 'Something went wrong.' });
    }
};
exports.default = verifyToken;
