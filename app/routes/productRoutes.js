const express = require('express');
const router = express.Router();
const multer = require('multer');
const upload = multer(); // memory storage
const productController = require('../controllers/product.controller.js');
const authMiddleware = require('../middleware/auth.middleware.js');

router.use(authMiddleware.authenticateToken);

// CREATE PRODUCT
router.post('/createproduct', upload.single('image'), productController.createProduct);

// GET ALL PRODUCTS (with pagination + search)
router.get('/getproducts', productController.getAllProducts);

// GET PRODUCT BY NAME
router.get('/getproduct', productController.getProductByName);

// UPDATE PRODUCT BY NAME
router.put('/updateproduct', upload.single('image'), productController.updateProductByName);

// DELETE PRODUCT BY NAME
router.delete('/deleteproduct', productController.deleteProductByName);

module.exports = router;