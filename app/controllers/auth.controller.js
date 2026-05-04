const authService = require('../services/auth.service.js');

exports.login = async (req, res) => {
    try {
        const result = await authService.loginUser(req.body);
        res.json(result);
    } catch (err) {
        res.status(401).json({ error: err.message });
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