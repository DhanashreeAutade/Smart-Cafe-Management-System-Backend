const express = require('express');
const router = express.Router();
const roleController = require('../controllers/role.controller.js');

// CREATE ROLE
router.post('/createrole',roleController.createRole);

// GET ALL ROLES
router.get('/getrole', roleController.getAllRoles);


module.exports = router;