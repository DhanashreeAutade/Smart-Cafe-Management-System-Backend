const Role = require('../models/role.model.js');

// CREATE ROLE
const createRole = async (data) => {
    const role = new Role(data);
    return await role.save();
};

// GET ALL ROLES
const getAllRoles = async () => {
    return await Role.find();
};

module.exports = {
    createRole,
    getAllRoles
};