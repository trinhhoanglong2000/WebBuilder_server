const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const { v4: uuidv4 } = require('uuid');

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

exports.postImage = async (folder, data) => {
  try {
    const result = await Promise.all(data.map(async (item) => {
      const buf = Buffer.from(item.replace(/^data:image\/\w+;base64,/, ""), 'base64');
      const type = item.split(';')[0].split('/')[1];
      const res = await s3.upload({
        Body: buf,
        Bucket: "ezmall-bucket",
        ContentEncoding: 'base64',
        ContentType: `image/${type}`,
        ACL: 'public-read',
        Key: `${folder}/${uuidv4()}.${type}`
      }).promise();

      return res.Location;
    }))

    return result;
  } catch (error) {
    console.log(error)
    return null
  }
}

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