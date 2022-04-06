const bannerService = require('./bannerService');
const http = require('../../const');

exports.createBanner = async (req, res) => {
    // create new banner
    const bannerObj = req.body;
    const newBanner = await bannerService.createBanner(bannerObj);
    if (newBanner) {
        res.status(http.Created).json({
            statusCode: http.Created,
            data: newBanner,
            message: "Create banner successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getAllbanners = async (req, res) => {
    const result = await bannerService.findAll();
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get all banners successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}

exports.getBannerById = async (req, res) => {
    const id = req.params.id;
    console.log(id);
    const result = await bannerService.findById(id);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get banner successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}