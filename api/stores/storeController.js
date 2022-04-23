const storeService = require('./storeService');
const pageService = require('../page/pageService');
const productService = require('../products/productService');
const productcollectionService = require('../collections/productcollections/productcollectionService');
const bannercollectionService = require('../collections/bannercollections/bannercollectionService');
const productOptionService = require('../products_option/ProductOptionService')
const productVariantService = require('../variants/VariantsService')
const http = require('../../const');

exports.createStore = async (req, res) => {
    // create new store
    const storeObj = req.body;
    storeObj.user_id = req.user.id;
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
    const userId = req.user.id;
    let query = req.query;
    query.user_id = userId
    const result = await storeService.findByUserId(query);
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

exports.changeContent = async (req, res) => {
    const pageId = req.params.pageId;
    const storeId = req.params.storeId;
    const result = await pageService.savePageContent(storeId, pageId, req.body);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Update page successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};

exports.loadContent = async (req, res) => {
    const storeId = req.params.storeId;
    const pageId = req.params.pageId;
    const content = await pageService.findPageById(storeId, pageId)
    res.status(http.Success).json(content);
}

exports.uploadCssFile = async (req, res) => {
    const id = req.params.storeId;
    const css_body = req.body;
    const result = await storeService.uploadCssFileForStore(id, css_body);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Upload file successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getProductsByStoreId = async (req, res) => {
    const storeId = req.params.id;
    const query = req.query
    query.store_id = storeId
    const result = await productService.getProductsByStoreId(query);
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

exports.getProductCollectionsByStoreId = async (req, res) => {
    const storeId = req.params.id;
    const query = req.query
    query.store_id = storeId
    const result = await productcollectionService.getData(query)
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

exports.getBannerCollectionsByStoreId = async (req, res) => {
    const storeId = req.params.id;
    const result = await bannercollectionService.getCollectionsByStoreId(storeId);
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

exports.getInitDataStore = async (req, res) => {
    const storeId = req.params.id;
    const logoURL = storeService.getLogo(storeId);
    const listPagesId = pageService.getPagesByStoreId(storeId);
    const storeCssData = storeService.getCssFileForStore(storeId);
    const result = await Promise.all([logoURL, listPagesId, storeCssData]);

    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: {
                logoURL: result[0].logo_url,
                listPagesId: result[1],
                storeCssData: result[2]
            },
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

exports.createProduct = async (req, res) => {
    // create new product
    const ProductObj = req.body;
    let quantity = 0
    const id = req.params.id
    let productQuery = req.body.product
    productQuery.store_id = id


    let productOptionQuery = req.body.option
    let variantQuery = req.body.variant
    let collectionQuery = req.body.collection

    
    //Create Product
    const newProduct = await productService.createProduct(productQuery);
    let productId = newProduct.rows[0].id

    //Create Collection
    if (collectionQuery){
        for (let i = 0 ; i <collectionQuery.length; i ++){
            let query = {
                "product_id" : productId,
                "productcollection_id": collectionQuery[i]
            }
            const newCollection = await productcollectionService.createProductandCollectionLink(query)
        }
    }
    //Create Option
    
    if (productOptionQuery) {
        for (let i = 0; i < productOptionQuery.length; i++) {
            let query = {
                "name": productOptionQuery[i].name,
                "product_id": productId
            }
            const newOption = await productOptionService.createDataOption(query)

            //Create Option Value
            for (let j = 0; j < productOptionQuery[i].value.length; j++) {
                let optionQuery = {
                    "name": productOptionQuery[i].name,
                    "value": productOptionQuery[i].value[j],
                    "product_id": productId,
                    "option_id": newOption.rows[0].id
                }
                const newOptionValue = await productOptionService.createDataOptionValue(optionQuery)
            }
            
        }
    }

    //Create Variant
    if (variantQuery) {
        for (let i = 0; i < variantQuery.length; i++) {
            let option_value_id = []
            let createVariantQuery = variantQuery[i]
            for (let j = 0; j < createVariantQuery.option_value.length; j++){
                let query = createVariantQuery.option_value[j]
              
                query.product_id = productId
                const findOptionValue = await productOptionService.findDataOptionValue(query)
                option_value_id.push(findOptionValue[0].id)
            }
            quantity += createVariantQuery.quantity
            delete createVariantQuery.option_value
            createVariantQuery.option_value_id = option_value_id
            createVariantQuery.product_id = productId
            const createOptionValue = await productVariantService.createVariant(createVariantQuery)
            let updateQuery = {
                "id" : productId,
                "inventory" : quantity
            }
            const updateValue = await productService.updateProduct(updateQuery)
        }
       
    }
    if (newProduct) {
        res.status(http.Created).json({
            statusCode: http.Created,
            data: newProduct,
            message: "Create product successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}