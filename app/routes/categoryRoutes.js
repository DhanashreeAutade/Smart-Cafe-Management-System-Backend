const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');

router.use(authMiddleware.authenticateToken);

router.post('/createcategory', categoryController.createCategory);
router.get('/getcategories', categoryController.getAllCategories);
router.get('/getcategory', categoryController.getCategoryById);
router.put('/updatecategory', categoryController.updateCategory);
router.delete('/deletecategory', categoryController.deleteCategory);

module.exports = router;