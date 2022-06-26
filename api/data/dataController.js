const dataService = require('./dataService');
const http = require('../../const');

exports.getCity = async (req, res) => {
 
    //const result = await emailService.sendVerifyEmail(mail);
    const result = await dataService.getCity()
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get city"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};

exports.getDistrict = async (req, res) => {
 
    const result = await dataService.getDistrict(req.params.id)

    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get District"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};

exports.convertMoney = async (req, res) => {
    const query = req.body
    const result = await dataService.changeMoney(query)

    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get Money"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
};