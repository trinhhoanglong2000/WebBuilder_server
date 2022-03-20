const AWS = require('aws-sdk');

const s3 = new AWS.S3();

exports.uploadCssFileForStore = async (storeId, css_body) => {
    try {
        await s3.putObject({
            Body: JSON.stringify(css_body, null, '\t'),
            Bucket: "ezmall-bucket",
            Key: `css/${storeId}.json`
        }).promise();
        return {message: "Update successfully!"};
    } catch (error) {
        console.log(error);
        return null;
    }
}

exports.getCssFileForStore = async (storeId) => {
    try {
        const data =  await s3.getObject({
            Bucket: "ezmall-bucket",
            Key: `css/${storeId}.json`
        }).promise();
        const content = JSON.parse(data.Body.toString('utf-8'));
        return content;
    } catch (error) {
        console.log(error);
        return null;
    }
}