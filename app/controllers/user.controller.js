const userService = require('../services/user.service.js');


// CREATE USER
exports.createUser = async (req, res) => {
    try {
        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};


// GET ALL USERS (Pagination + Search)
exports.getAllUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || '';

        const result = await userService.getAllUsers({
            page,
            limit,
            search
        });

        res.json(result);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};


// GET USER BY ID
exports.getUserById = async (req, res) => {
    try {
        const id = req.query.id;

        const user = await userService.getUserById(id);

        res.json(user);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};


// UPDATE USER BY ID
exports.updateUser = async (req, res) => {
    try {
        const id = req.query.id;

        const updatedUser = await userService.updateUserById(id, req.body);

        res.json(updatedUser);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};


// DELETE USER BY ID
exports.deleteUser = async (req, res) => {
    try {
        const id = req.query.id;

        const result = await userService.deleteUserById(id);

        res.json(result);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const result = await userService.resetPassword(req.body);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};