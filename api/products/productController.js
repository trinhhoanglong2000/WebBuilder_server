const productService = require('./productService');

const http = require('../../const');
const productOptionService = require('../products_option/ProductOptionService')
const productVariantService = require('../variants/VariantsService')
const productCollectionSerice = require('../collections/productcollections/productcollectionService');
const fileService = require('../files/fileService')
exports.updateProduct = async (req, res) => {
    // update produt
    const productId = req.params.id;

    let productQuery = req.body.product
    if (productQuery) {
        delete productQuery["update"]
    }
    else {
        productQuery = {}
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

        const option = await productOptionService.getOptionFromProductId(productId)
        if (!option) {
            res.status(http.ServerError).json({
                statusCode: http.ServerError,
                message: "Server error!"
            })
            return
        }
        let productOptionQueryWithoutDelete = productOptionQuery.filter((e) => e.update === "Delete")
        let countOption = 0

        while (countOption < option.length) {
            const found = productOptionQueryWithoutDelete.find(e => e.id === option[countOption].id)
            if (found) {
                option.splice(countOption, 1)
            }
            else {
                countOption++
            }
        }

        for (let i = 0; i < productOptionQuery.length; i++) {
            let optionId

            let query = productOptionQuery[i]
            query.product_id = productId
            let updateStatus = productOptionQuery[i].update
            let valueStatus = productOptionQuery[i].value
            delete query["update"]
            delete query["value"]


            if (updateStatus == "Add") {
                query.rank = countOption
                countOption++
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

            const optionValue = await productOptionService.findDataOptionValue({ option_id: optionId })
            let valueStatusWithoutDelete = valueStatus.filter((e) => e.update === "Delete")
            let countOptionValue = 0

            while (countOptionValue < optionValue.length) {
                const found = valueStatusWithoutDelete.find(e => e.id === optionValue[countOptionValue].id)
                if (found) {
                    optionValue.splice(countOptionValue, 1)
                }
                else {
                    countOptionValue++
                }
            }

            for (let j = 0; j < optionValue.length; j++) {
                let optionQuery = {
                    "rank": j,
                    "id": optionValue[j].id
                }
                await productOptionService.updateDataOptionValue(optionQuery, "id")
            }
            for (let j = 0; j < valueStatus.length; j++) {
                let optionQuery = valueStatus[j]
                optionQuery.option_id = optionId
                optionQuery.product_id = productId
                optionQuery.name = productOptionQuery[i].name
                let optionUpdateStatus = optionQuery.update
                delete optionQuery["update"]
                if (optionUpdateStatus == "Add") {
                    optionQuery.rank = countOptionValue
                    countOptionValue++
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
            let option_value_Promise = []
            let createVariantQuery = variantQuery[i]
            for (let j = 0; j < createVariantQuery.option_value.length; j++) {
                let query = createVariantQuery.option_value[j]

                query.product_id = productId
                option_value_Promise.push(productOptionService.findDataOptionValue(query))
                //const findOptionValue = await productOptionService.findDataOptionValue(query)
                // if (findOptionValue[0]) {
                //     option_value_id.push(findOptionValue[0].id)
                // }

            }
            let resultPromise = await Promise.all(option_value_Promise)

            for (let j = 0; j < createVariantQuery.option_value.length; j++) {
                if (resultPromise[j][0]) {
                    option_value_id.push(resultPromise[j][0].id)
                }

            }

            quantity += createVariantQuery.quantity
            let updateStatus = createVariantQuery.update

            delete createVariantQuery.option_value
            delete createVariantQuery.update

            createVariantQuery.option_value_id = option_value_id
            createVariantQuery.product_id = productId

            if (createVariantQuery.price) {
                await productService.updateProduct({ id: productId, price: createVariantQuery.price })
            }

            let updatePromise = []
            if (updateStatus == "Add") {

                updatePromise.push(productVariantService.createVariant(createVariantQuery))
                // const creatVariant = await productVariantService.createVariant(createVariantQuery)
                await Promise.all(updatePromise)
            }
            else if (updateStatus == "Change") {

                updatePromise.push(productVariantService.updateVariant(createVariantQuery))
                // const updateVariant = await productVariantService.updateVariant(createVariantQuery)
                await Promise.all(updatePromise)

            }
            else if (updateStatus == "Delete") {
                quantity -= createVariantQuery.quantity
                let query = {
                    id: createVariantQuery.id
                }
                const deleteVariant = await productVariantService.deleteVariant(query)
            }
        }

        quantity = 0
        let price
        const product = await productVariantService.getVariant(productId)
        for (let i = 0; i < product.length; i++) {
            if (i == 0) {
                price = product[i].price
            }
            if (parseFloat(product[i].price) < parseFloat(price)) {
                price = product[i].price
            }
            
            quantity += product[i].quantity
        }
        let updateQuery = {
            "id": productId,
            "inventory": quantity
        }
        if (price) {
            updateQuery.price = price
        }

        const updateValue = await productService.updateProduct(updateQuery)
    }
    // let price = await productService.updatePrice({product_id : productId})
    // if (price){
    //      await productService.updateProduct({"id": productId, price : price})
    // }
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
    const storeId = req.query.store_id

    if (!storeId) {
        res.status(http.BadRequest).json({
            statusCode: http.BadRequest,
      
            message: "Get product unsuccessfully!"
        })
        return
    }

    const result = await productService.findById(id);
    let returnData = {}
    if (result.length > 0) {
        if (result[0].store_id != storeId) {
            res.status(http.BadRequest).json({
                statusCode: http.BadRequest,
    
                message: "Get product unsuccessfully!"
            })
            return
        }
        if (result[0].description) {
            const content = await productService.getDescription(result[0].id)
            result[0].description = content
        }
        returnData.product = result

        const PromiseResult = await Promise.all([productOptionService.getOptionFromProductId(id), productVariantService.getVariant(id), productCollectionSerice.getProductCollectionByProductId(id)])
        let resultOption = PromiseResult[0]
        if (resultOption) {
            // for (let i = 0; i < resultOption.length; i++) {
            //     const resultOptionValue = await productOptionService.getDataOptionValue(resultOption[i].id)
            //     resultOption[i].value = resultOptionValue
            // }
            const result = await Promise.all(resultOption.map((ele, i) => {
                return productOptionService.getDataOptionValue(ele.id)
            }))
            resultOption.forEach((ele, index) => {
                ele.value = result[index]
            })
            returnData.option = resultOption
        }
        let resultVariant = PromiseResult[1]
        if (resultVariant) {
            const PromiseArr = []
            for (let i = 0; i < resultVariant.length; i++) {
                let PromiseArrChildren = []
                for (let j = 0; j < resultVariant[i].option_value_id.length; j++) {
                    // const resultOptionValue = await productOptionService.getDataOptionValueById(resultVariant[i].option_value_id[j])
                    // optionValue.push(resultOptionValue[0])
                    PromiseArrChildren.push(productOptionService.getDataOptionValueById(resultVariant[i].option_value_id[j]))
                }
                // resultVariant[i].option_value = optionValue
                // delete resultVariant[i].option_value_id
                PromiseArr.push(Promise.all(PromiseArrChildren))
            }
            const PromiseResult = await Promise.all(PromiseArr)
            for (let i = 0; i < resultVariant.length; i++) {
                let optionValue = []
                for (let j = 0; j < resultVariant[i].option_value_id.length; j++) {
                    // const resultOptionValue = await productOptionService.getDataOptionValueById(resultVariant[i].option_value_id[j])
                    optionValue.push(PromiseResult[i][j][0])
                }
                resultVariant[i].option_value = optionValue
                delete resultVariant[i].option_value_id
            }
            returnData.variant = resultVariant
        }
        let resultCollection = PromiseResult[2]
        returnData.collection = resultCollection
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

exports.updateInventory = async (req, res) => {
    const result = await productService.updateInventory(req.body);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Update products inventory successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}