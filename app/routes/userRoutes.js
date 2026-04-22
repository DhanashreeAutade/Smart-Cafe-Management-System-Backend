const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller.js');

// CREATE USER
router.post('/createuser', userController.createUser);

// GET ALL USERS (with pagination + search)
router.get('/getusers', userController.getAllUsers);

// GET USER BY ID
router.get('/getuser', userController.getUserById);

// UPDATE USER
router.put('/updateuser', userController.updateUser);

// DELETE USER
router.delete('/deleteuser', userController.deleteUser);

module.exports = router;