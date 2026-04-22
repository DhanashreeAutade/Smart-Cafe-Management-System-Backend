const Role = require('../models/role.model.js');

// CREATE ROLE
exports.createRole = async (data) => {
    if (!data.roleName) {
        throw new Error('Role name is required');
    }

    // check if role already exists
    const existingRole = await Role.findOne({ roleName: data.roleName });
    if (existingRole) {
        throw new Error('Role already exists');
    }

    const role = new Role(data);
    return await role.save();
};

// GET ALL ROLES
exports.getAllRoles = async ({ page = 1, limit = 5, search = '' }) => {
    
    // convert to number
    page = parseInt(page);
    limit = parseInt(limit);

    // search filter
    const query = {
        roleName: { $regex: search, $options: 'i' } // case-insensitive
    };

    // total count
    const total = await Role.countDocuments(query);
    const totalPages = Math.ceil(total / limit);


    if (page > totalPages && total !== 0) {
        throw new Error('Data not found');
    }
    // fetch data
    const roles = await Role.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });

    return {
        total,
        page,
        totalPages,
        roles
    };
};

// DELETE ROLE BY NAME
exports.deleteRole = async (roleName) => {
    if (!roleName) {
        throw new Error('Role name is required');
    }

    const deletedRole = await Role.findOneAndDelete({ roleName });

    if (!deletedRole) {
        throw new Error('Role not found');
    }

    return {
        message: 'Role deleted successfully',
        deletedRole
    };
}

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
