const Product = require('../models/product.model.js');
const Category = require('../models/category.model.js');
const fs = require('fs');
const path = require('path');

// CREATE PRODUCT
exports.createProduct = async (body, file) => {
    const { name, price, description, category } = body;

    if (!name || !price || !description || !category) {
        throw new Error('Name, price, description, and category are required');
    }

    let imagePath = null;
    if (file) {
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const uniqueName = Date.now() + '-' + file.originalname;
        const savedPath = path.join(uploadDir, uniqueName);
        fs.writeFileSync(savedPath, file.buffer);
        imagePath = `/uploads/${uniqueName}`;
    }
    
    const product = new Product({
        name,
        price,
        description,
        category,
        image: imagePath
    });

    await product.save();
    
    // Add product to category
    await Category.findByIdAndUpdate(category, { $addToSet: { products: product._id } });

    return product;
};

// GET ALL PRODUCTS (Pagination + Search)
exports.getAllProducts = async ({ page, limit, search }) => {
    const skip = (page - 1) * limit;
    const query = search ? { name: { $regex: search, $options: 'i' } } : {};

    const products = await Product.find(query)
        .populate('category', 'name')
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
    const total = await Product.countDocuments(query);

    return {
        products,
        total,
        page,
        pages: Math.ceil(total / limit)
    };
};


// GET PRODUCT BY NAME
exports.getProductByName = async (name) => {
    const product = await Product.findOne({ name }).populate('category', 'name');
    if (!product) {
        throw new Error('Product not found');
    }
    return product;
};


// UPDATE PRODUCT BY NAME
exports.updateProductByName = async (name, body, file) => {
    const { price, description, category } = body;

    const product = await Product.findOne({ name });
    if (!product) {
        throw new Error('Product not found');
    }

    // Validate new category if provided
    if (category) {
        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            throw new Error('Category not found');
        }
        
        // Remove from old category
        await Category.findByIdAndUpdate(product.category, { $pull: { products: product._id } });
        
        product.category = category;
        
        // Add to new category
        await Category.findByIdAndUpdate(category, { $addToSet: { products: product._id } });
    }

    if (body.name) product.name = body.name;
    if (price) product.price = price;
    if (description) product.description = description;

    if (file) {
        if (product.image) {
            const oldImagePath = path.join(__dirname, '..', product.image);
            if (fs.existsSync(oldImagePath)) {
                fs.unlinkSync(oldImagePath);
            }
        }
        const uploadDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        const uniqueName = Date.now() + '-' + file.originalname;
        const newImagePath = path.join(uploadDir, uniqueName);
        fs.writeFileSync(newImagePath, file.buffer);
        product.image = `/uploads/${uniqueName}`;
    }

    await product.save();
    return product;
};

// DELETE PRODUCT BY NAME
exports.deleteProductByName = async (name) => {
    const product = await Product.findOne({ name });
    if (!product) {
        throw new Error('Product not found');
    }

    if (product.image) {
        const imagePath = path.join(__dirname, '..', product.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }
    }

    // Remove product from category
    await Category.findByIdAndUpdate(product.category, { $pull: { products: product._id } });

    await Product.findOneAndDelete({ name });
    return { message: 'Product deleted successfully' };
};