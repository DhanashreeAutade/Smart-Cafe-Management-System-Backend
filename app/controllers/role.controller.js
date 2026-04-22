const roleService = require('../services/role.service.js');

// CREATE ROLE
exports.createRole = async (req, res) => {
    try {
        const role = await roleService.createRole(req.body);
        res.status(201).json(role);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// GET ALL ROLES
exports.getAllRoles = async (req, res) => {
    try {
        const roles = await roleService.getAllRoles();
        res.json(roles);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};