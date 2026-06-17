const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');

router.use(authMiddleware.authenticateToken);

router.get('/getsettings', settingsController.getSettings);
router.put('/updatesettings', settingsController.updateSettings);

module.exports = router;
