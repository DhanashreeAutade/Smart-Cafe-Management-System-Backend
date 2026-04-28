const productService = require('../services/product.service.js');

// CREATE PRODUCT
exports.createProduct = async (req, res) => {
    try {
        const product = await productService.createProduct(req.body, req.file);
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// GET ALL PRODUCTS (Pagination + Search)
exports.getAllProducts = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || '';

        const result = await productService.getAllProducts({
            page,
            limit,
            search
        });

        res.json(result);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

// GET PRODUCT BY NAME
exports.getProductByName = async (req, res) => {
    try {
        const name = req.query.name;

        const product = await productService.getProductByName(name);

        res.json(product);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

// UPDATE PRODUCT BY NAME
exports.updateProductByName = async (req, res) => {
    try {
        const name = req.query.name;

        const updatedProduct = await productService.updateProductByName(name, req.body, req.file);

        res.json(updatedProduct);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

// DELETE PRODUCT BY NAME
exports.deleteProductByName = async (req, res) => {
    try {
        const name = req.query.name;

        const result = await productService.deleteProductByName(name);

        res.json(result);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};