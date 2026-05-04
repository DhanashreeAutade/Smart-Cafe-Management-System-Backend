const User = require('../models/user.model.js');
const bcrypt = require('bcryptjs');


// CREATE USER (Registration)
exports.createUser = async (data) => {
    const { name, email, city, state, roleName , password, phone } = data;

    // validation
    if (!name || !email || !city || !state || !password || !phone) {
        throw new Error('All fields are required');
    }

    // check unique email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('Email already exists');
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
        name,
        email,
        city,
        state,
        roleName,
        password: hashedPassword,
        phone
    });

    return await user.save();
};



// GET ALL USERS (Pagination + Search)
exports.getAllUsers = async ({ page = 1, limit = 5, search = '' }) => {

    page = parseInt(page);
    limit = parseInt(limit);

    // search on multiple fields
    const query = {
        $or: [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } },
            { roleName: { $regex: search, $options: 'i' } }
        ]
    };

    const total = await User.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // page overflow check
    if (page > totalPages && total !== 0) {
        throw new Error('Data not found');
    }

    const users = await User.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

    return {
        total,
        page,
        totalPages,
        users
    };
};



// GET USER BY ID
exports.getUserById = async (id) => {
    if (!id) {
        throw new Error('User ID is required');
    }

    const user = await User.findById(id);

    if (!user) {
        throw new Error('User not found');
    }

    return user;
};



// UPDATE USER BY EMAIL (email cannot be changed)
exports.updateUserByEmail = async (email, data) => {
    if (!email) {
        throw new Error('Email is required');
    }

    //  prevent email update
    if (data.email) {
        throw new Error('Email cannot be changed');
    }

    // optional: hash password if updated
    if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
    }

    const updatedUser = await User.findOneAndUpdate(
        { email },        // find by email
        { $set: data },   // update fields
        { new: true }
    );

    if (!updatedUser) {
        throw new Error('User not found');
    }

    return updatedUser;
};


// DELETE USER BY ID
exports.deleteUserById = async (id) => {
    if (!id) {
        throw new Error('User ID is required');
    }

    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
        throw new Error('User not found');
    }

    return {
        message: 'User deleted successfully',
        deletedUser
    };
};

exports.resetPassword = async ({ email, newPassword }) => {
    if (!email || !newPassword) {
        throw new Error('Email and new password are required');
    }

    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }

    // hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    await user.save();

    return { message: 'Password updated successfully' };
};