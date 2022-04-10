const service = require('./carouselsService');
const http = require('../../../const')

exports.getAllCollections = (req, res) => {
    const storeID = req.query.storeID;
    //console.log("ID: " +storeID)
    let result =service.getAllCarouselCollections(storeID)
    console.log(result)
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
        })
    } else {
        res.status(http.NotFound).json({
            statusCode: http.ServerError,
            message: "Server error"
        })
    }
}

exports.getCategoryData= (req, res) => {
    const categoryId = req.params.id;
    console.log(req.params)
    let result =service.getCategoryData(categoryId)
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
        })
    } else {
        res.status(http.NotFound).json({
            statusCode: http.ServerError,
            message: "Server error"
        })
    }
}