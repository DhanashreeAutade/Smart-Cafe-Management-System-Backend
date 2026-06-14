const jwt = require('jsonwebtoken');
const config = require('../../config/config.js');

const extractToken = (req) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (authHeader) {
        const parts = authHeader.split(' ');
        return parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : authHeader;
    }

    const cookieHeader = req.headers.cookie || '';
    const tokenCookie = cookieHeader
        .split(';')
        .map((cookie) => cookie.trim())
        .find((cookie) => cookie.startsWith('token='));

    return tokenCookie ? tokenCookie.split('=')[1] : null;
};

exports.authenticateToken = (req, res, next) => {
    const token = extractToken(req);
    if (!token) {
        return res.status(401).json({ error: 'Authorization token missing' });
    }

    try {
        const payload = jwt.verify(token, config.JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
