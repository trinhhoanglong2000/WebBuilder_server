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
      return { Location:  result.Location};
    } catch (error) {
      console.log(error);
      return null;
    }
};