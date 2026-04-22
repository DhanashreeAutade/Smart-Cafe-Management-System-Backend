const roleService = require('../services/role.service.js');

// CREATE ROLE
exports.createRole = async (req, res) => {
    try {
        const role = await roleService.createRole(req.body);
        res.status(201).json(role);
    } catch (err) {
        res.status(400).json({ error: err.message }); // better status
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

exports.deleteRole = async (req, res) => {
    try {
        const roleName = req.query.roleName; 

        const role = await roleService.deleteRole(roleName);
        res.json(role);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};