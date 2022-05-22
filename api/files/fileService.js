const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.uploadTextFileToS3 = async (body, key, type) => {

  try {
    const result = await s3.upload({
      // Body: JSON.stringify(content, null, '\t'),
      Body: body,
      Bucket: "ezmall-bucket",
      ContentType: `text/${type}`,
      ACL: 'public-read',
      Key: `${key}.${type}`
    }).promise();
    return { Location: result.Location };
  } catch (error) {
    console.log(error);
    return null;
  }
};

exports.deleteObject = async (url) => {
  try {
    const key = url.substring(54);
    const params = {
      Bucket: "ezmall-bucket",
      Key: key
    }
    const result = await s3.deleteObject(params).promise()
    return result
  } catch (error) {
    console.log(error);
    return null;
  }
}