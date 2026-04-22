const User = require('../models/user.model.js');


// CREATE USER

exports.createUser = async (data) => {
    const { name, email, city, state, roleName } = data;

    // validation
    if (!name || !email || !city || !state || !roleName) {
        throw new Error('All fields are required');
    }
    // check unique email
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('Email already exists');
    }

    const user = new User({
        name,
        email,
        city,
        state,
        roleName
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



// UPDATE USER BY ID
exports.updateUserById = async (id, data) => {
    if (!id) {
        throw new Error('User ID is required');
    }

    // if email is being updated → check uniqueness
    if (data.email) {
        const existingUser = await User.findOne({ email: data.email });
        if (existingUser && existingUser._id.toString() !== id) {
            throw new Error('Email already exists');
        }
    }

    const updatedUser = await User.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true } // return updated document
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