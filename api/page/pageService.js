const DBHelper = require('../../helper/DBHelper/DBHelper');
const AWS = require('aws-sdk');
const URLParser = require('../../helper/common')

const s3 = new AWS.S3();

const db = require('../../database');
const { v4: uuidv4 } = require('uuid');

exports.createPage = async (pageBody) => {
  try {
    pageBody.id = uuidv4();

    const s3Result = await s3.upload({
      Body: JSON.stringify("", null, '\t'),
      Bucket: "ezmall-bucket",
      ACL: 'public-read',
      ContentType: 'text/txt',
      Key: `pages/${pageBody.store_id}/${pageBody.id}.txt`
    }).promise();

    pageBody.content_url = s3Result ? s3Result.Location : "";
    pageBody.page_url = '/' + pageBody.name.trim().replace(' ', '-').toLowerCase();

    const result = await db.query(`
            INSERT INTO pages (id, store_id, name, content_url, page_url) 
            VALUES ($1, $2, $3, $4, $5)
            returning id, content_url, page_url;
            `, [pageBody.id, pageBody.store_id, pageBody.name, pageBody.content_url, pageBody.page_url]);
    
    return result;
    // return DBHelper.insertData(pageBody, 'pages', false);
  } catch (error) {
    console.log(error);
    return null;
  }

};

exports.updatePage = async (data) => {
  data.name = data.name.trim();
  data.page_url = '/' + URLParser.generateURL(data.name);
  return DBHelper.updateData(data, "pages", "id")
}

exports.deletePage = async (query) => {
  return DBHelper.deleteData('pages', query)
}

exports.getPageByName = async (name, store_id) => {
  const result = await db.query(`
            SELECT * 
            FROM pages
            WHERE LOWER(name)=LOWER('${name}') and (store_id)=('${store_id}')
    `)
    return result.rows;
}

exports.getPagesByStoreId = async (query) => {
  let condition = [];

  condition.push({ store_id: query.store_id })
  if (query.name)
    condition.push({ name: query.name })

  let config = {
    where: {
      "OP.AND": condition
    }
  }
  return DBHelper.FindAll("pages", config)
};

exports.savePageContent = async (storeId, pageId, content) => {

  try {
    await s3.putObject({
      Body: JSON.stringify(content, null, '\t'),
      Bucket: "ezmall-bucket",
      ContentType: 'text/json',
      ACL: 'public-read',
      Key: `pages/${storeId}/${pageId}.json`
    }).promise();
    return { message: "Update successfully!" };
  } catch (error) {
    console.log(error);
    return null;
  }
};

exports.getPageContentURL = async (pageId) => {
  try {
    const result = await db.query(`
            SELECT content_url 
            FROM pages 
            WHERE (id = '${pageId}')
        `)

    return result.rows[0].contentURL;
  } catch (error) {
    console.log(error);
    return null;
  }
}

exports.findPageById = async (storeId, pageId) => {
  try {
    const data = await s3.getObject({
      Bucket: "ezmall-bucket",
      Key: `pages/${storeId}/${pageId}.json`
    }).promise();
    const content = JSON.parse(data.Body.toString('utf-8'));
    return content;
  } catch (error) {
    console.log(error);
    return null;
  }
};