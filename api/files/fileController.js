const http = require('../../const');
const fileService = require('./filesService');

exports.getFileName = async (req, res) =>{
    console.log(req.params.filename);
    res.status(http.Success).sendFile(`${req.params.filename}`,{root:'.'})
}


exports.uploadCssFile = async (req, res) => {
    const id = req.params.storeId;
    const css_body = req.body;
    const result = await fileService.uploadCssFileForStore(id, css_body);
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

exports.getCssFile = async (req, res) => {
    const id = req.params.storeId;
    const result = await fileService.getCssFileForStore(id);
    if (result) {
        res.status(http.Success).json({
            statusCode: http.Success,
            data: result,
            message: "Get file successfully!"
        })
    }
    else {
        res.status(http.ServerError).json({
            statusCode: http.ServerError,
            message: "Server error!"
        })
    }
}