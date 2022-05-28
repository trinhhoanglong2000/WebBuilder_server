const storeService = require('./storeService');
const pageService = require('../page/pageService');
const productService = require('../products/productService');
const productcollectionService = require('../collections/productcollections/productcollectionService');
const bannercollectionService = require('../collections/bannercollections/bannercollectionService');
const productOptionService = require('../products_option/ProductOptionService')
const productVariantService = require('../variants/VariantsService')
const menuService = require('../menu/menuService');
const menuItemService = require('../menuItem/menuItemService');
const http = require('../../const');
const DBHelper = require('../../helper/DBHelper/DBHelper');
const { createAccountWithSocialLogin } = require('../accounts/accountService');

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

exports.getCustomType = async (req, res) => {
    // create new store
    const storeId = req.params.id;
    let query = {
        store_id : storeId,
        custom_type : true
    }
    const newStore = await productService.getAllCustomType(query)
    let returnData =[]
    if (newStore){
        for (let i = 0; i < newStore.length; i++){
            returnData.push(newStore[i].type)
        }
    }
    if (newStore) {
        res.status(http.Created).json({
            statusCode: http.Created,
            data: returnData,
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

exports.getVendor = async (req, res) => {
    // create new store
    const storeId = req.params.id;
    let query = {
        store_id : storeId,
    }
    const newStore = await productService.getVendor(query)
    let returnData =[]
    if (newStore){
        for (let i = 0; i < newStore.length; i++){
            returnData.push(newStore[i].vendor)
        }
    }
    if (newStore) {
        res.status(http.Created).json({
            statusCode: http.Created,
            data: returnData,
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

exports.getStoreByName = async (req, res) => {
    const name = req.params.name.trim();
    const result = await storeService.getStoreByName(name);
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

exports.getPageByName = async (req, res) => {
    const name = req.params.name;
    const store_id = req.params.id;
    const result = await pageService.getPageByName(name, store_id);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "get page successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};


exports.changeContent = async (req, res) => {
    const pageId = req.params.pageId;
    const storeId = req.params.storeId;
    const result = await pageService.savePageContent(storeId, pageId, req.body); 
    await pageService.saveHTMLFile(storeId,pageId,req.body)
    //console.log(req.body)
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

exports.uploadStoreComponentsFile = async (req, res) => {
    const id = req.params.storeId;
    const data = req.body.traitData;

    const result = await storeService.uploadStoreComponentsFile(id, data);
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

exports.getPagesByStoreId = async (req, res) => {
    const query = req.query;
    query.store_id = req.params.id;
    const result = await pageService.getPagesByStoreId(query);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get pages successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};

exports.getMenuByStoreId = async (req, res) => {
    const query = req.query;
    query.store_id = req.params.id;
    const result = await menuService.getMenuByStoreId(query);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get menu successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};

exports.getListMenuItems = async (req, res) => {
    const query = req.query;
    query.store_id = req.params.id;
    const listMenu = await menuService.getMenuByStoreId(query);

    if (listMenu) {
        const navigation = await Promise.all(listMenu.map(async (item) => {
            const menuItems = await menuItemService.getMenuItemByMenuId({ menu_id: item.id });
            return {
                ...item,
                listMenuItem: menuItems
            };
        }))
        res.status(http.Success).json({
            statusCode: http.Success,
            data: navigation,
            message: "Get menu successfully!"
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

exports.getStoreComponents = async (req, res) => {
    const storeId = req.params.id;

    const result = await storeService.getStoreComponents(storeId);
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
}


exports.getInitDataStore = async (req, res) => {
    const storeId = req.params.id;
    const query = req.query;
    query.store_id = storeId;

    const logoURL = storeService.getLogo(storeId);
    const listPagesId = pageService.getPagesByStoreId(query);
    const storeTemplate = storeService.getTemplate(storeId)

    const result = await Promise.all([logoURL, listPagesId, storeTemplate]);

    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: {
                logoURL: result[0].logo_url,
                listPagesId: result[1],
                template : result[2]
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

exports.updateStoreData = async (req, res) => {
    const storeId = req.params.storeId;
    const logoUrl = req.body.logoUrl;
    const storeComponents = req.body.storeComponents;
    
    const task1 = DBHelper.updateData({ id: storeId, logo_url: logoUrl }, "stores", "id");
    const task2 = storeService.uploadStoreComponentsFile(storeId, storeComponents);

    const result = await Promise.all([task1, task2]);

    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            message: "Save store data success!"
        });
        return;
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server Error!"
        });
    }
    return;
}

exports.createProduct = async (req, res) => {
    let check = {
        id: req.params.id,
        user_id: req.user.id
    }
    let authen = await this.AuthenticateUserAndStore(req, res, check)
    if (!authen) {
        return
    }
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
    if (collectionQuery) {
        for (let i = 0; i < collectionQuery.length; i++) {
            let query = {
                "product_id": productId,
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
            for (let j = 0; j < createVariantQuery.option_value.length; j++) {
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
                "id": productId,
                "inventory": quantity
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
exports.createCollection = async (req, res) => {
    let check = {
        id: req.params.id,
        user_id: req.user.id
    }
    let authen = await this.AuthenticateUserAndStore(req, res, check)
    if (!authen) {
        return
    }

    // create collection
    let collectionQuery = req.body.collection
    let productQuery = req.body.products
    const newCollection = await productcollectionService.createProductCollection(collectionQuery)

    let collectionId = newCollection.rows[0].id
    //Create Collection
    if (productQuery) {
        for (let i = 0; i < productQuery.length; i++) {
            let query = {
                "product_id": productQuery[i],
                "productcollection_id": collectionId
            }
            const newProduct = await productcollectionService.createProductandCollectionLink(query)
        }
    }
    if (newCollection) {
        res.status(http.Created).json({
            statusCode: http.Created,
            data: newCollection,
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

exports.updateLogoUrl = async (req, res) => {
    const storeId = req.params.storeId;
    const logoUrl = req.body.logoUrl;

    const data = {
        id: storeId,
        logo_url: logoUrl
    }

    const result = await DBHelper.updateData(data, "stores", "id");
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            message: "Save logo URL success!"
        });
        return;
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server Error!"
        });
    }
    return;
}
exports.AuthenticateUserAndStore = async (req, res, check) => {
    if (req.user) {
        let query = {
            id: check.id,
            user_id: check.user_id
        }
        const authenticateUser = await storeService.FindUserAndStore(query)
        if (!authenticateUser[0]) {
            res.status(http.Created).json({
                statusCode: 403,
                message: "Forbiden!"
            })
            return
        }
        else {
            return authenticateUser
        }
    }
}