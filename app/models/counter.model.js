const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    count: {
        type: Number,
        default: 0
    }
}, { timestamps: true });


// Ensure date is always set to the start of the day
// counterSchema.pre('save', function(next) {
//     const today = new Date();
//     today.setHours(0, 0, 0, 0);
//     this.date = today;
//     next();
// });

module.exports = mongoose.model('Counter', counterSchema);
