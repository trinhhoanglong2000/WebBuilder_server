const orderService = require('./orderService');
const http = require('../../const')
const URLParser = require('../../helper/common/index')
exports.changeOrderStatus = async  (req,res) => {
    const query = req.body
    query.order_id = req.params.id
    const result = await orderService.createOrderStatus(query)
    
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Successfully Change Status"
        })
    }
    else {
        res.status(http.NotAcceptable).json({
            statusCode: http.NotAcceptable,
            data: result,
            message: "No data found"
        })
    }
}
