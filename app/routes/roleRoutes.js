const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');

router.use(authMiddleware.authenticateToken);

// CREATE ROLE
router.post('/createrole',roleController.createRole);

// GET ALL ROLES
router.get('/getrole', roleController.getAllRoles);

router.delete('/deleterole', roleController.deleteRole);

module.exports = router;