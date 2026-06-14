const authService = require('../services/auth.service.js');

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

exports.login = async (req, res) => {
    try {
        const result = await authService.loginUser(req.body);
        res.cookie('token', result.token, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000,
        });
        res.json(result);
    } catch (err) {
        res.status(401).json({ error: err.message });
    }
};

exports.getCurrentUser = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }

    res.json({ user: { id: req.user.id, roleName: req.user.roleName } });
};

exports.refreshToken = async (req, res) => {
    try {
        const token = extractToken(req);
        if (!token) {
            return res.status(401).json({ error: 'Token missing' });
        }

        const payload = authService.getPayloadFromToken(token);
        const newToken = authService.generateAccessToken({ id: payload.id, roleName: payload.roleName });

        res.cookie('token', newToken, {
            httpOnly: true,
            sameSite: 'lax',
            maxAge: 60 * 60 * 1000,
        });

        res.json({ message: 'Token refreshed', token: newToken });
    } catch (err) {
        res.status(401).json({ error: err.message || 'Invalid or expired token' });
    }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
    try {
        const result = await authService.forgotPassword(req.body.email);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


// RESET PASSWORD
exports.resetPassword = async (req, res) => {
    try {
        const result = await authService.resetPassword(req.body);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token', { sameSite: 'lax' });
    res.json({ message: 'Logged out' });
};