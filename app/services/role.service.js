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
exports.getAllRoles = async () => {
    return await Role.find();
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
