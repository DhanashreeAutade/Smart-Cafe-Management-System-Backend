const jwt = require('jsonwebtoken');
const config = require('../../config/config.js');

exports.authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header missing' });
    }

    const parts = authHeader.split(' ');
    const token = parts.length === 2 && parts[0] === 'Bearer' ? parts[1] : authHeader;
    if (!token) {
        return res.status(401).json({ error: 'Bearer token missing' });
    }

    try {
        const payload = jwt.verify(token, config.JWT_SECRET);
        req.user = payload;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};
