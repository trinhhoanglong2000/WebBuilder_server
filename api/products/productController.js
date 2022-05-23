const productService = require('./productService');

const http = require('../../const');
const productOptionService = require('../products_option/ProductOptionService')
const productVariantService = require('../variants/VariantsService')
const productCollectionSerice = require('../collections/productcollections/productcollectionService');
const { collection } = require('../accounts/accountModel');
exports.updateProduct = async (req, res) => {
    // update produt
    const productId = req.params.id;

    let productQuery = req.body.product
    if (productQuery) {
        delete productQuery["update"]
    }
    productQuery.id = productId

    const newProduct = await productService.updateProduct(productQuery)
    let collectionQuery = req.body.collection
    let productOptionQuery = req.body.option
    let variantQuery = req.body.variant

    //Update Collection
    if (collectionQuery) {
        for (let i = 0; i < collectionQuery.length; i++) {
            let query = {
                "product_id": productId,
                "productcollection_id": collectionQuery[i].id
            }
            if (collectionQuery[i].update == "Add") {
                const newCollection = await productCollectionSerice.createProductandCollectionLink(query)
            } else {
                const deleteCollection = await productCollectionSerice.deleteProductandCollectionLink(query)
            }
        }
    }

    //Update Option

    if (productOptionQuery) {
        for (let i = 0; i < productOptionQuery.length; i++) {
            let optionId

            let query = productOptionQuery[i]
            query.product_id = productId
            let updateStatus = productOptionQuery[i].update
            let valueStatus = productOptionQuery[i].value
            delete query["update"]
            delete query["value"]


            if (updateStatus == "Add") {

                const newOption = await productOptionService.createDataOption(query)
                optionId = newOption.rows[0].id
            } else if (updateStatus == "Change") {
                query.id = productOptionQuery[i].id

                //Change Option 
                optionId = productOptionQuery[i].id
                const changeOption = await productOptionService.updateDataOption(query)
            } else if (updateStatus == "Delete") {
                let deleteQuery = {
                    id: productOptionQuery[i].id
                }

                //Delete Option Value
                let optionQuery = {
                    "option_id": productOptionQuery[i].id
                }
                const deleteOptionValue = await productOptionService.deleteDataOptionValue(optionQuery)
                //Delete Value
                const deleteOption = await productOptionService.deleteDataOption(deleteQuery)
                continue
            }
            //Update Option Value
            for (let j = 0; j < valueStatus.length; j++) {
                let optionQuery = valueStatus[j]
                optionQuery.option_id = optionId
                optionQuery.product_id = productId
                optionQuery.name = productOptionQuery[i].name
                let optionUpdateStatus = optionQuery.update
                delete optionQuery["update"]
                if (optionUpdateStatus == "Add") {
                    const newOptionValue = await productOptionService.createDataOptionValue(optionQuery)
                }
                else if (optionUpdateStatus == "Change") {
                    const changeOptionValue = await productOptionService.updateDataOptionValue(optionQuery, "id")
                }
                else if (optionUpdateStatus == "Delete") {
                    let deleteQuery = {
                        id: valueStatus[j].id
                    }
                    const deleteOptionValue = await productOptionService.deleteDataOptionValue(deleteQuery)
                }
            }

        }
    }

    //Update variant 
    let quantity = 0
    if (variantQuery) {
        for (let i = 0; i < variantQuery.length; i++) {
            let option_value_id = []
            let createVariantQuery = variantQuery[i]
            for (let j = 0; j < createVariantQuery.option_value.length; j++) {
                let query = createVariantQuery.option_value[j]

                query.product_id = productId
                const findOptionValue = await productOptionService.findDataOptionValue(query)
                if (findOptionValue[0]) {
                    option_value_id.push(findOptionValue[0].id)
                }

            }
            quantity += createVariantQuery.quantity
            let updateStatus = createVariantQuery.update

            delete createVariantQuery.option_value
            delete createVariantQuery.update

            createVariantQuery.option_value_id = option_value_id
            createVariantQuery.product_id = productId

            if (updateStatus == "Add") {
                const creatVariant = await productVariantService.createVariant(createVariantQuery)
            }
            else if (updateStatus == "Change") {
                const updateVariant = await productVariantService.updateVariant(createVariantQuery)
            }
            else if (updateStatus == "Delete") {
                quantity -= createVariantQuery.quantity
                let query = {
                    id: createVariantQuery.id
                }
                const deleteVariant = await productVariantService.deleteVariant(query)
            }
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


exports.deleteProduct = async (req, res) => {
    const id = req.params.id

    let productQuery = {}
    productQuery.id = id

    let productRelativeQuery = {}
    productRelativeQuery.product_id = id
    const deleteProduct_Variant = await productService.deleteProductRelative("product_variant", productRelativeQuery)
    const deleteProduct_ProductOptionValue = await productService.deleteProductRelative("product_optionvalue", productRelativeQuery)
    const deleteProduct_ProductOption = await productService.deleteProductRelative("product_option", productRelativeQuery)
    const deleteProduct_ProductCollection = await productService.deleteProductRelative("product_productcollection", productRelativeQuery)
    const newProduct = await productService.deleteProduct(productQuery)
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

exports.getAllProducts = async (req, res) => {
    const result = await productService.findAll();
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get all products successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getProductById = async (req, res) => {
    const id = req.params.id;
    const result = await productService.findById(id);
    let returnData = {}
    if (result[0]) {
        returnData.product = result
        let resultOption = await productOptionService.getOptionFromProductId(id)
        if (resultOption) {
            for (let i = 0; i < resultOption.length; i++) {
                const resultOptionValue = await productOptionService.getDataOptionValue(resultOption[i].id)
                resultOption[i].value = resultOptionValue
            }
            returnData.option = resultOption
        }
        let resultVariant = await productVariantService.getVariant(id)
        if (resultVariant) {
            for (let i = 0; i < resultVariant.length; i++) {
                let optionValue = []
                for (let j = 0; j < resultVariant[i].option_value_id.length; j++) {
                    const resultOptionValue = await productOptionService.getDataOptionValueById(resultVariant[i].option_value_id[j])
                    optionValue.push(resultOptionValue[0])
                }
                resultVariant[i].option_value = optionValue
                delete resultVariant[i].option_value_id
            }

            returnData.variant = resultVariant
        }
        let resultCollection = await productCollectionSerice.getProductCollectionByProductId(id)
        returnData.collection = resultCollection

        //console.log(returnData)
        res.status(http.Success).json({
            statusCode: http.Success,
            data: returnData,
            message: "Get product successfully!"
        })
        return
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
    console.log("Foo")
}
