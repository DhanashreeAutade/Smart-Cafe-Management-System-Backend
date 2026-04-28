const Category = require('../models/category.model.js');
const Product = require('../models/product.model.js');

exports.createCategory = async (data) => {
    const { name, description } = data;
    if (!name) throw new Error('Category name is required');

    const existing = await Category.findOne({ name });
    if (existing) throw new Error('Category already exists');

    const category = new Category({ name, description });
    return category.save();
};

exports.getAllCategories = async ({ page = 1, limit = 5 }) => {
    page = parseInt(page);
    limit = parseInt(limit);

    const total = await Category.countDocuments();

    const categories = await Category.find()
        .select('_id name')              // include id + name
        .skip((page - 1) * limit)       // pagination
        .limit(limit)
        .sort({ createdAt: -1 });       // newest first (optional)

    return {
        total,
        page,
        totalPages: Math.ceil(total / limit),
        categories
    };
};

exports.getCategoryById = async (id) => {
    if (!id) {
        throw new Error('Category ID is required');
    }

    const category = await Category.findById(id)
        .select('_id name'); //  only id + name

    if (!category) {
        throw new Error('Category not found');
    }

    return category;
};

exports.updateCategoryById = async (id, data) => {
    if (!id) throw new Error('Category ID is required');

    const updated = await Category.findByIdAndUpdate(
        id,
        { name: data.name, description: data.description },
        { new: true }
    );
    if (!updated) throw new Error('Category not found');
    return updated;
};

exports.deleteCategoryById = async (id) => {
    if (!id) {
        throw new Error('Category ID is required');
    }

    const category = await Category.findById(id);
    if (!category) {
        throw new Error('Category not found');
    }
    const productCount = await Product.countDocuments({ category: id });

    // Check if category has any products
    if (productCount > 0) {
    throw new Error('Category cannot be deleted. Remove products first.');
    }

    await Category.findByIdAndDelete(id);
    return { message: 'Category deleted successfully' };
};
