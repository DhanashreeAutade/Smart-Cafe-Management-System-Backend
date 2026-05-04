const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    roleName: {
        type: String,
        required: true,
        enum: ['admin', 'customer', 'staff']
    },
    phone: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    //  for reset password
    resetToken: String,
    resetTokenExpiry: Date

}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);