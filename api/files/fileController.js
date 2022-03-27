const http = require('../../const');

exports.getFileName = async (req, res) =>{
    console.log(req.params.filename);
    res.status(http.Success).sendFile(`${req.params.filename}`,{root:'.'})
}

exports.uploadAsset = async (req, res) => {
    const files = req.files;
    const result = files.reduce((list, item) => {
        list.push(item.location);
        return list;
    }, []);
    
    res.status(http.Success).json({
        statusCode: http.Success,
        data: result,
        message: "Uploaded!"
    });
}