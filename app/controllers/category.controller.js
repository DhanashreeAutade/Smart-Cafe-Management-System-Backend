const categoryService = require('../services/category.service.js');

exports.createCategory = async (req, res) => {
    try {
        const category = await categoryService.createCategory(req.body);
        res.status(201).json(category);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 5;
        const search = req.query.search || '';

        const result = await categoryService.getAllCategories({ page, limit, search });
        res.json(result);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

exports.getCategoryById = async (req, res) => {
    try {
        const id = req.query.id;
        const category = await categoryService.getCategoryById(id);
        res.json(category);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const updatedCategory = await categoryService.updateCategoryById(id, req.body);
        res.json(updatedCategory);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
};

const Category = require('../models/category.model.js');
const Product = require('../models/product.model.js');

exports.deleteCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const result = await categoryService.deleteCategoryById(id);
        res.json(result);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};