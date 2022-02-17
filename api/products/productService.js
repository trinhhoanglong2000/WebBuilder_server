const mongoose = require('mongoose');
const Product = require('./productModel');

exports.createProduct = (productObj) => {
    try {
        // create
        productObj._id = mongoose.Types.ObjectId();
        const product = new Product(productObj);
        return product.save();
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.findAll = () => {
    try {
        const products = Product.find({}).limit(20);
        return products;
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.findById = (id) => {
    try {
        const Product = Product.findById(id)
        return Product;
    } catch (error) {
        console.log(error);
        return null;
    }    
}