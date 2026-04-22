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
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);