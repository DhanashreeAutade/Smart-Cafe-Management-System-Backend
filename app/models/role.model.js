const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    // roleId: {
    //     type: Number,
    //     unique: true
    // },
    roleName: {
        type: String,
        required: true,
        enum: ['admin', 'customer', 'staff']
    },
    description: String
},
    { timestamps: true });

module.exports = mongoose.model('Role', roleSchema);