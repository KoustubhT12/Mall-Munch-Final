import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

function middleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        console.log('Authorization header missing or malformed');
        return res.status(401).json({ message: "You need to login first!" });
    }

    const token = authHeader.split(' ')[1]; // Extract token after 'Bearer '

    try {
        console.log('Token found:', token);
        const decoded = jwt.verify(token, process.env.SECRET);
        console.log('Decoded token:', decoded);
        
        req.user = {
            id: decoded.id
        };
        
        return next();
    } catch (e) {
        console.log("JWT Verification Error:", e.message);
        return res.status(401).json({ 
            message: "Invalid or expired token",
            error: e.message 
        });
    }
}

export default middleware;
