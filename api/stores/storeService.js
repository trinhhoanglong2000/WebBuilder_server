const mongoose = require('mongoose');
const Store = require('./storeModel');

exports.createStore = (storeObj) => {
    try {
        // create
        storeObj._id = mongoose.Types.ObjectId();
        storeObj.userId = mongoose.Types.ObjectId(storeObj.userId);
        const store = new Store(storeObj);
        return store.save();
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.findAll = () => {
    try {
        const stores = Product.find({}).limit(20);
        return stores;
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.findByUserId = (userId, filter) => {
    try {
        
        filter.userId = mongoose.Types.ObjectId(userId)
        console.log(filter);
        const stores = Store.find(filter).limit(20);
        return stores;
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.findById = (id) => {
    try {
        const store = Store.findById(id)
        return store;
    } catch (error) {
        console.log(error);
        return null;
    }    
}