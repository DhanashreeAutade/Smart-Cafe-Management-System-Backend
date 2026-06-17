const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
    key: {
        type: String,
        default: 'cafe',
        unique: true
    },
    maxTables: {
        type: Number,
        default: 10,
        min: 1,
        max: 100
    }
}, { timestamps: true });

module.exports = mongoose.model('Settings', settingsSchema);
