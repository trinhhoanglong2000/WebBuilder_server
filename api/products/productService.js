const mongoose = require('mongoose');
const Product = require('./productModel');

exports.createProduct = (productObj) => {
    try {
        // create
        productObj._id = mongoose.Types.ObjectId();
        productObj.storeId = mongoose.Types.ObjectId(productObj.storeId);
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

exports.findByPageId = (pageId, filter) => {
    try {
        
        filter.pageId = mongoose.Types.ObjectId(pageId)
        const products = Product.find(filter).limit(20);
        return products;
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.findById = (id) => {
    try {
        const product = Product.findById(id)
        return product;
    } catch (error) {
        console.log(error);
        return null;
    }    
}