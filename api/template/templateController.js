const templateService = require('./templateService');
const http = require('../../const')
const URLParser = require('../../helper/common/index')
// exports.getFreeTemplate = async  (req,res) => {
//     const query = req.query

//     const result = await templateService.getFreeTemplate(query)
    
//     if (result.length > 0 ) {
//         res.status(http.Success).json({
//             statusCode: http.Success,
//             data: result,
//             message: "Success Return Data"
//         })
//     }
//     else {
//         res.status(http.NotAcceptable).json({
//             statusCode: http.NotAcceptable,
//             data: result,
//             message: "No data found"
//         })
//     }
// }
