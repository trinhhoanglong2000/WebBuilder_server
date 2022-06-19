const storeService = require('./storeService');
const pageService = require('../page/pageService');
const templateService = require('../template/templateService')
const productService = require('../products/productService');
const productcollectionService = require('../collections/productcollections/productcollectionService');
const bannercollectionService = require('../collections/bannercollections/bannercollectionService');
const bannerService = require('../banners/bannerService')
const productOptionService = require('../products_option/ProductOptionService')
const productVariantService = require('../variants/VariantsService')
const menuService = require('../menu/menuService');
const menuItemService = require('../menuItem/menuItemService');
const http = require('../../const');
const DBHelper = require('../../helper/DBHelper/DBHelper');
const { createAccountWithSocialLogin } = require('../accounts/accountService');
const URLParser = require('../../helper/common/index')
const orderService = require('../order/orderService')
const emailService = require('../email/emailService')
exports.createStore = async (req, res) => {
    // create new store
    const storeObj = req.body;
    storeObj.user_id = req.user.id;
    const newStore = await storeService.createStore(storeObj);

    const storeId = newStore ? newStore.rows[0].id : ""
    // CREATE CONFIG fILE
    URLParser.createConfigHTML(storeId)

    //CREATE DEFAULT PAGE
    const template = await templateService.getTemplate({name : "template-default"})
    await templateService.useTemplate({user_id :req.user.id, store_id : storeId, template_id : template[0].id})
    // let page = await pageService.createPage({ store_id: storeId, name: "Home" }, "", true, "template-default");
    // if (page) {
    //     await pageService.createHTMLFile(storeId, page.rows[0].id)
    // }

    // page = await pageService.createPage({ store_id: storeId, name: "Products" }, "", true, "template-default");
    // if (page) {
    //     await pageService.createHTMLFile(storeId, page.rows[0].id)
    // }

    // page = await pageService.createPage({ store_id: storeId, name: "Cart" }, "", true, "template-default");
    // if (page) {
    //     await pageService.createHTMLFile(storeId, page.rows[0].id)
    // }

    //CREATE HEADER AND FOOTER

    if (newStore) {
         // //query { 
    //     subject
    //     text
    //     store_id
    //     receiver
    // }
            
        let query  = {
            store_id : storeId,
            subject: "New Store Created",
            receiver : 'ttlgame123@gmail.com',
            html : `<p>Verify your email address to complete the signup and login to your account.</p>`
        }
        await emailService.sendMailFromStore(query)
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
        store_id: storeId,
        custom_type: true
    }
    const newStore = await productService.getAllCustomType(query)
    let returnData = []
    if (newStore) {
        for (let i = 0; i < newStore.length; i++) {
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
        store_id: storeId,
    }
    const newStore = await productService.getVendor(query)
    let returnData = []
    if (newStore) {
        for (let i = 0; i < newStore.length; i++) {
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
    //await pageService.saveHTMLFile(storeId, pageId, req.body)
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

exports.publishStore = async (req, res) => {

    const storeId = req.params.id;

    const store = await storeService.findById(storeId)
    const result = await storeService.publishStore(storeId)
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: true,
            message: "Publish Store successfully!"
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
exports.getPagesPolicy = async (req, res) => {
    const query = req.query;
    query.store_id = req.params.id;
    const result = await pageService.getPagesPolicy(query);
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

    for (let i = 0; i < result.length; i++) {
        if (result[i].description) {
            const content = await productcollectionService.getDescription(result[i].id)
            result[i].description = content
        }
    }
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
    const query = req.query
    query.store_id = storeId
    const result = await bannercollectionService.getCollectionsByStoreId(query);
    console.log(result)
    for (let i = 0; i < result.length; i++) {
        if (result[i].description) {
            const content = await bannercollectionService.getDescription(result[i].id)
            result[i].description = content
        }
    }
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

    const logoURL = storeService.getStoreLogoById(storeId);
    const listPagesId = pageService.getPagesByStoreId(query);
    const storeTemplate = storeService.getTemplate(storeId)

    const result = await Promise.all([logoURL, listPagesId, storeTemplate]);

    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: {
                logoURL: result[0].logo_url,
                listPagesId: result[1],
                template: result[2]
            },
            message: "Get data successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};

exports.getHeaderData = async (req, res) => {
    const storeId = req.params.id;
    const query = req.query;
    query.store_id = storeId;

    const logoURL = storeService.getStoreLogoById(storeId);
    const storeName = storeService.getStoreNameById(storeId);
    const menuItems = menuItemService.getHeaderMenuItemsByStoreId(query);

    const result = await Promise.all([logoURL, storeName, menuItems]);

    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: {
                logoURL: result[0].logo_url,
                storeName: result[1].name,
                menuItems: result[2],
            },
            message: "Get data successfully!"
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
                "product_id": productId,
                "rank": i
            }
            const newOption = await productOptionService.createDataOption(query)

            //Create Option Value
            for (let j = 0; j < productOptionQuery[i].value.length; j++) {
                let optionQuery = {
                    "name": productOptionQuery[i].name,
                    "value": productOptionQuery[i].value[j],
                    "product_id": productId,
                    "option_id": newOption.rows[0].id,
                    "rank": j
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
                //console.log(findOptionValue)
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

exports.createBannerCollection = async (req, res) => {
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
    let bannerQuery = req.body.banners
    const newCollection = await bannercollectionService.createBannerCollection(collectionQuery)

    let collectionId = newCollection.rows[0].id
    //Create Collection
    if (bannerQuery) {
        for (let i = 0; i < bannerQuery.length; i++) {
            let query = bannerQuery[i]
            query.bannercollection_id = collectionId
            const newBanner = await bannerService.createBanner(query)
        }
    }
    if (newCollection) {
        res.status(http.Created).json({
            statusCode: http.Created,
            data: newCollection,
            message: "Create banner Collection successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.deleteStore = async (req, res) => {
    const id = req.params.id
    let check = {
        id: req.params.id,
        user_id: req.user.id
    }
    let authen = await this.AuthenticateUserAndStore(req, res, check)
    if (!authen) {
        return
    }

    let query = {
        store_id: id
    }
    //Get Data Collections
    const bannerCollection = await bannercollectionService.getCollectionsByStoreId(query);
    const productCollection = await productcollectionService.getData(query)
    const products = await productService.getProductsByStoreId(query)
    const pages = await pageService.getPagesByStoreId(query)

    //Delete Data Collection
    if (bannerCollection.length > 0) {
        for (let i = 0; i < bannerCollection.length; i++) {
            await bannercollectionService.deleteBanner({ id: bannerCollection[i].id })
        }
    }
    if (productCollection.length > 0) {
        for (let i = 0; i < productCollection.length; i++) {
            await productcollectionService.deleteProduct({ id: productCollection[i].id })
        }
    }

    if (products.length > 0) {
        for (let i = 0; i < products.length; i++) {
            let productQuery = {}
            productQuery.id = products[i].id

            let productRelativeQuery = {}
            productRelativeQuery.product_id = products[i].id
            await productService.deleteProductRelative("product_variant", productRelativeQuery)
            await productService.deleteProductRelative("product_optionvalue", productRelativeQuery)
            await productService.deleteProductRelative("product_option", productRelativeQuery)
            await productService.deleteProductRelative("product_productcollection", productRelativeQuery)
            await productService.deleteProduct(productQuery)
        }
    }

    if (pages.length > 0) {
        for (let i = 0; i < pages.length; i++) {
            await pageService.deletePage({ id: pages[i].id })
        }
    }

    let deleteStore = await storeService.deleteStores({ id: id })
    if (deleteStore) {
        res.status(http.Created).json({
            statusCode: http.Created,
            data: deleteStore,
            message: "Delete Stores successfully!"
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

exports.getCurrentTemplateByStore = async (req, res) => {
    const result = await templateService.getStoreTemplate({ store_id: req.params.id })
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
}

exports.getPaidTemplateByStore = async (req, res) => {
    const query = req.query;
    query.store_id = req.params.id;
    query.user_id = req.user.id
    const result = await templateService.getPaidStoreTemplate(query)
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get Paid Template Successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getFreeTemplateByStore = async (req, res) => {
    const query = req.query;
    query.store_id = req.params.id;
    query.user_id = req.user.id
    const result = await templateService.getFreeStoreTemplate(query)
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get Free Template Successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getTemplatesByStore = async (req, res) => {
    const query = req.query;
    query.store_id = req.params.id;
    query.user_id = req.user.id
    console.log(URLParser.generateCode())
    const result = await templateService.getAllTemplatesAccount(query)
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get All Template Successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.createOrder = async (req, res) => {
    // create order
    let productQuery = req.body.products
    let orderQuery = req.body.order
    let originalPrice = 0
    let checkOutOfStock = false
    if (!productQuery) {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
        return
    }

    //CREATE ID
    const orderId = await orderService.createOrderId()
    
    //CHECK PRODUCT QUANTITY EXIST
    for (let i = 0; i < productQuery.length; i++) {
        const query = productQuery[i]
        if (query.is_variant) {
            const variant = await productVariantService.getVariantById(query.variant_id)
            const product = await productService.findById(query.id)
           
            if (variant.length > 0 && product.length > 0) {
                const remainQuantity = variant[0].quantity - query.quantity
                if (remainQuantity < 0) {
                    if (!product[0].continue_sell) {
                        res.status(http.ServerError).json({
                            statusCode: http.ServerError,
                            message: "Create Order Unsuccesfully, out of stock!"
                        })
                        return
                    }
                    else {
                        checkOutOfStock = true
                    }
                }

            } else {
                res.status(http.ServerError).json({
                    statusCode: http.ServerError,
                    message: "Create Order Unsuccesfully!"
                })
                return
            }
        }
        else {
            const product = await productService.findById(query.id)
            
            if (product.length > 0) {
                const remainQuantity = product[0].inventory - query.quantity
                if (remainQuantity < 0) {
                    if (!product[0].continue_sell) {
                        res.status(http.ServerError).json({
                            statusCode: http.ServerError,
                            message: "Create Order Unsuccesfully!"
                        })
                        return
                    }
                    else {
                        checkOutOfStock = true
                    }
                }
            }
        }
    }

    //CREATE PRODUCT_ORDER
    for (let i = 0; i < productQuery.length; i++) {
        const query = productQuery[i]
        const product_id = productQuery[i].id
        delete query["id"]
        if (product_id) {
            query.product_id = product_id
        }
        query.order_id = orderId
        let remainquantity = 0
        
        if (query.is_variant) {
            const variant = await productVariantService.getVariantById(query.variant_id)
            remainquantity = variant[0].quantity - query.quantity
            originalPrice += query.quantity * query.price
            if (!checkOutOfStock) {
                await productVariantService.updateVariant({id : variant[0].id, quantity: remainquantity})
                await productService.updateInventoryFromVariants(query.product_id)
            }
        }
        else {
            const product = await productService.findById(query.product_id)
            remainquantity = product[0].inventory - query.quantity
            if (!checkOutOfStock) {
                await productService.updateProduct({id : product[0].id, inventory : remainquantity})
            }
        }
        await orderService.createOrderProduct(query)
    }

    //CREATE ORDER STATUS
    const statusQuery = {
        order_id : orderId,
        status : checkOutOfStock? "RESTOCK" : "CREATED",
    }
    await orderService.createOrderStatus(statusQuery)

    //CREATE ORDER
    orderQuery.id = orderId
    orderQuery.original_price = originalPrice
    const newOrder = await orderService.createOrder(orderQuery)
    if (newOrder) {
        res.status(http.Created).json({
            statusCode: http.Created,
            data: newOrder.rows,
            message: "Create Order successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }

}

exports.getOrderByStore = async (req, res) => {
    const query = req.query;
    query.store_id = req.params.id;
    const result = await orderService.getAllStoreOrder(query)
    
    for (let i = 0 ; i < result.length; i++){
        const status = await orderService.getAllOrderStatus({order_id : result[i].id})
        result[i].status_date = status[0].create_at,
        result[i].status = status[0].status
    }
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get All Order Successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}