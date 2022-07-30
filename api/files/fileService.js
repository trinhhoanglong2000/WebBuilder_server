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

exports.getFile = async (key) => {

  try {
    const data = await s3.getObject({
      Bucket: "ezmall-bucket",
      Key: `${key}`
    }).promise();
    const content = data.Body.toString('utf-8')
    return content;
  } catch (error) {
    console.log(error);
    return null;
  }
};

exports.uploadImageToS3 = async (key, data) => {
  try {
    const buf = Buffer.from(data.replace(/^data:image\/\w+;base64,/, ""), 'base64');
    const type = data.split(';')[0].split('/')[1];
    const res = await s3.upload({
      Body: buf,
      Bucket: "ezmall-bucket",
      ContentEncoding: 'base64',
      ContentType: `image/${type}`,
      ACL: 'public-read',
      Key: `${key}.${type}`
    }).promise();

    return res.Location;

  } catch (error) {
    console.log(error)
    return null
  }
}

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

exports.deleteObjectByKey = async (key) => {
  try {
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

// exports.deleteFolderByKey = async (key) => {
//   try {
//     const params = {
//       Bucket: "ezmall-bucket",
//       Key: key
//     }
//     const result = await s3.deleteObject(params).promise()
//     console.log(await s3.listObjectsV2(params).promise())
//     return result
//   } catch (error) {
//     console.log(error);
//     return null;
//   }
// }

exports.deleteFolderByKey = async (dir) => {
  const bucket = "ezmall-bucket"
  const listParams = {
    Bucket: bucket,
    Prefix: dir
  };

  const listedObjects = await s3.listObjectsV2(listParams).promise();

  if (listedObjects.Contents.length === 0) return;

  const deleteParams = {
    Bucket: bucket,
    Delete: { Objects: [] }
  };

  listedObjects.Contents.forEach(({ Key }) => {
    deleteParams.Delete.Objects.push({ Key });
  });

  await s3.deleteObjects(deleteParams).promise();

  if (listedObjects.IsTruncated) await emptyS3Directory(bucket, dir);
}

exports.checkExistFile = async (key) => {
  try {
    const params = {
      Bucket: "ezmall-bucket",
      Key: key
    }

    const exists = await s3.headObject(params).promise()
      .then(
        () => true,
        err => {
          if (err.code === 'NotFound') {
            return false;
          }
          throw err;
        }
      );
    console.log(key)
    return exists
  } catch (error) {
    console.log(error);
    return null;
  }
}