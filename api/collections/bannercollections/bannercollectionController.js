const collectionService = require('./bannercollectionService');
const bannerService = require('../../banners/bannerService');
const http = require('../../../const');

exports.createCollection = async (req, res) => {
    // create new collection
    const collectionObj = req.body;
    const newCollection = await collectionService.createCollection(collectionObj);
    if (newCollection) {
        res.status(http.Created).json({
            statusCode: http.Created,
            data: newCollection,
            message: "Create collection successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getAllCollections = async (req, res) => {
    const result = await collectionService.findAll();
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get all collections successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getcollectionById = async (req, res) => {
    const id = req.params.id;
    const result = await collectionService.findById(id);
    const listBanners = await bannerService.getBannersByCollectionId(id);
    if (listBanners) result.listBanners = listBanners;
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get collection successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getBannersByCollectionId = async (req, res) => {
    const collectionId = req.params.id;
    const result = await bannerService.getBannersByCollectionId(collectionId);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get products successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};