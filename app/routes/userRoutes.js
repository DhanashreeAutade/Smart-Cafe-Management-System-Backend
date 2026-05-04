const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js').authenticateToken;


// CREATE USER
router.post('/createuser', userController.createUser);

// GET ALL USERS (with pagination + search)
router.get('/getusers',authMiddleware, userController.getAllUsers);

// GET USER BY ID
router.get('/getuser', authMiddleware, userController.getUserById);

// UPDATE USER
router.put('/updateuser', authMiddleware, userController.updateUser);

// DELETE USER
router.delete('/deleteuser', authMiddleware, userController.deleteUser);

// reset password
router.post('/reset-password', userController.resetPassword);

module.exports = router;