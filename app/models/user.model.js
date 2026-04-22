const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: String,
    lastName: String,
    emailId: String,
    mobileNo: String,
    city: String,
    state: String,
    password: String,
   role: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Role'
}
}, { timestamps: true });   

module.exports = mongoose.model('User', userSchema);
