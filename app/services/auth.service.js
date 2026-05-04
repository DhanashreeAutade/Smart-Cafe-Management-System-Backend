const User = require('../models/user.model.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('../../config/config');
const crypto = require('crypto');

exports.loginUser = async (data) => {
    const { email, password } = data;

    if (!email || !password) {
        throw new Error('Email and password are required');
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    
    const token = jwt.sign(
        { id: user._id, roleName: user.roleName },
        config.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return { message: 'Login successful', token, user: { id: user._id, name: user.name, roleName: user.roleName } };
};

exports.forgotPassword = async (email) => {
    if (!email) {
        throw new Error('Email is required');
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }

    // (optional) restrict to admin
    if (user.roleName !== 'admin') {
        throw new Error('Not an admin account');
    }

    const token = crypto.randomBytes(32).toString('hex');

    user.resetToken = token;
    user.resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 min

    await user.save();

    return {
        message: 'Reset token generated',
        token   // 👉 shown in frontend (for now)
    };
};



//  RESET PASSWORD using token
exports.resetPassword = async ({ token, newPassword }) => {
    if (!token || !newPassword) {
        throw new Error('Token and new password required');
    }

    const user = await User.findOne({
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() }
    });

    if (!user) {
        throw new Error('Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    return { message: 'Password reset successful' };
};