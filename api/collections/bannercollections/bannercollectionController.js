const collectionService = require('./bannercollectionService');
const bannerService = require('../../banners/bannerService');
const http = require('../../../const');

exports.createCollection = async (req, res) => {
    // create new collection
    const collectionObj = req.body;
    console.log(req.body)
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

exports.updateBannerCollection = async (req, res) => {
    // update new collection
    const collectionId = req.body.collection.id
    const collectionObj = req.body.collection;
    const updateCollection = await collectionService.updateBannerCollection(collectionObj)
    const bannerQuery = req.body.banners
    
    // Update Banner
    if (bannerQuery) {
        for (let i = 0; i < bannerQuery.length; i++) {
            let query = bannerQuery[i]
            query.bannercollection_id = collectionId
            let update
            if (query.update){
                update = query.update
                delete query["update"]
            }
            // let query = {
            //     "product_id": bannerQuery[i].id,
            //     "productcollection_id": collectionId
            // }
            if (update == "Add") {
                await bannerService.createBanner(query)
            } else if (update == "Change") {
                await bannerService.updateBanners(query)
            }
            else if (update == "Delete"){
                let deleteQuery = { bannercollection_id : collectionId, id : bannerQuery[i].id }
                await bannerService.deleteBannerRelative("banners",deleteQuery)
            }
        }
    }
    if (updateCollection) {
        res.status(http.Created).json({
            statusCode: http.Created,
            data: updateCollection,
            message: "Update Banner collection successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}
exports.deleteBannerCollection = async (req, res) => {
    const id = req.params.id

    let bannerQuery = {}
    bannerQuery.id = id

    // let bannerRelativeQuery = {
    //     bannercollection_id: id
    // }
    // await bannerService.deleteBannerRelative("banners", bannerRelativeQuery)
    const newProduct = await collectionService.deleteBanner(bannerQuery)
    if (newProduct) {
        res.status(http.Created).json({
            statusCode: http.Created,
            data: newProduct,
            message: "Delete product successfully!"
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
    let query = {}
    query.id = req.params.id
    const result = await collectionService.findById(query)

    let resultQuery = {}
    if (result.length > 0) {
        if (result[0].description) {
            const content = await collectionService.getDescription(result[0].id)
            result[0].description = content
        }
        if (result[0].id) {

            resultQuery.collection = result[0]
            const listProducts = await bannerService.getBannersByCollectionId(result[0].id)
            //const listProducts = await productService.getProductsByCollectionId(result[0].id, bannerQuery);
            if (listProducts) {
                resultQuery.banners = listProducts
            }
        }
    }
    if (result.length > 0) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: resultQuery,
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