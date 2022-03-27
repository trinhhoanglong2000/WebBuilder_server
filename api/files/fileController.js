const http = require('../../const');

exports.getFileName = async (req, res) =>{
    console.log(req.params.filename);
    res.status(http.Success).sendFile(`${req.params.filename}`,{root:'.'})
}

exports.uploadAsset = async (req, res) => {
    res.status(http.Success).json({message: 'Uploaded'});
}