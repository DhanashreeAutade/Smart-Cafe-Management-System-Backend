const User = require('../models/user.model.js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

// Configure nodemailer (replace with your SMTP settings)
const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email service
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

const registerUser = async (data) => {
    const { name, email, city, state, roleName = 'customer' } = data;

    if (!name || !email || !city || !state) {
        throw new Error('All fields are required');
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('Email already exists');
    }

    // Generate a random password
    const password = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        name,
        email,
        city,
        state,
        roleName,
        password: hashedPassword
    });

    await user.save();

    // Send password to email
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject: 'Your Account Password',
        text: `Hello ${name}, your password is: ${password}. Please change it after login.`
    };

    await transporter.sendMail(mailOptions);

    return { message: 'User registered successfully. Password sent to email.' };
};

const loginUser = async (data) => {
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
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    return { token, user: { id: user._id, name: user.name, email: user.email, roleName: user.roleName } };
};

module.exports = { registerUser, loginUser };