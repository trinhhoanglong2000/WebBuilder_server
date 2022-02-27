const storeService = require('./storeService');
const http = require('../../const');

exports.createStore = async (req, res) => {
    // create new store
    const storeObj = req.body;
    storeObj.userId = req.user._id;
    const newStore = await storeService.createStore(storeObj);
    if (newStore) {
        res.status(http.Created).json({
            statusCode: http.Created,
            data: newStore,
            message: "Create store successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getAllStores = async (req, res) => {
    const result = await storeService.findAll();
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get all stores successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getStoreByUserId = async (req, res) => {
    const userId = req.user._id;
    const filter = req.query;
    const result = await storeService.findByUserId(userId, filter);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get stores successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getStoreById = async (req, res) => {
    const id = req.params.id;
    const result = await storeService.findById(id);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get store successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}