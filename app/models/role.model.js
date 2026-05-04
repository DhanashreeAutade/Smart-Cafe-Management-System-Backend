const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    roleName: {
        type: String,
        required: true,
        unique: true, // 
    },
    description: String,

    //  for reset password
    resetToken: String,
    resetTokenExpiry: Date
    
}, { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);