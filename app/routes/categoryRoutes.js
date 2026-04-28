const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller.js');

// admin-only create/update/add routes can be protected with middleware
router.post('/createcategory', categoryController.createCategory);
router.get('/getcategories', categoryController.getAllCategories);
router.get('/getcategory', categoryController.getCategoryById);
router.put('/updatecategory', categoryController.updateCategory);
router.delete('/deletecategory', categoryController.deleteCategory);

module.exports = router;