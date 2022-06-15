const DBHelper = require('../../helper/DBHelper/DBHelper');
const storeService = require('../stores/storeService');
const templateService = require('../template/templateService')
const AWS = require('aws-sdk');
const URLParser = require('../../helper/common')
const fileService = require('../files/fileService')

const s3 = new AWS.S3();

const db = require('../../database');
const { v4: uuidv4 } = require('uuid');
const fse = require('fs-extra')

exports.createPage = async (pageBody, url = "", isDefault = false, templateName = null, templateType = "_index") => {
  try {
    pageBody.id = uuidv4();
    const templateNewName = templateName ?  URLParser.generateURL(templateName) : "template-default"
    const data = await s3.getObject({
      Bucket: "ezmall-bucket",
      Key: `templates/${templateNewName}/${templateType}.json`
    }).promise();
    const id_store_content = data.Body.toString('utf-8').match(/(?<=(?:store-id=\\\"))((?:.|\n)*?)(?=\\\")/g)[0]
    const content = JSON.parse(data.Body.toString('utf-8').replace(id_store_content, `${pageBody.store_id}`).replace(id_store_content, `${pageBody.store_id}`));

    const s3Result = await s3.upload({
      Body: JSON.stringify(content, null, '\t'),
      Bucket: "ezmall-bucket",
      ACL: 'public-read',
      ContentType: 'text/json',
      Key: `pages/${pageBody.store_id}/${pageBody.id}.json`
    }).promise();

    pageBody.content_url = s3Result ? s3Result.Location : "";
    if (url === "")
      pageBody.page_url = '/' + URLParser.generateURL(pageBody.name);
    else {
      pageBody.page_url = '/' + url
    }

    pageBody.page_url = await createValidURL(pageBody.page_url, pageBody.store_id)
    const result = await db.query(`
            INSERT INTO pages (id, store_id, name, content_url, page_url, is_default) 
            VALUES ($1, $2, $3, $4, $5 , $6)
            returning id, content_url, page_url;
            `, [pageBody.id, pageBody.store_id, pageBody.name, pageBody.content_url, pageBody.page_url, isDefault]);


    return result;
    // return DBHelper.insertData(pageBody, 'pages', false);
  } catch (error) {
    console.log(error);
    return null;
  }

};

var createValidURL = exports.createValidURL = async (name, storeId) => {
  const data = await FindPageByIdOnly({ store_id: storeId, page_url: name })
  if (data.length == 0) {
    return name
  }
  else {
    var count = 1
    var newName = name + "-" + count
    var newdata = await FindPageByIdOnly({ store_id: storeId, page_url: newName })
    while (newdata.length > 0) {
      count += 1
      newName = name + "-" + count
      newdata = await FindPageByIdOnly({ store_id: storeId, page_url: newName })
    }
    return newName
  }
}


exports.updatePage = async (data) => {
  data.name = data.name.trim();
  data.page_url = "/pages" + data.page_url
  data.page_url = URLParser.generateURL(data.page_url.trim())
  const result = URLParser.checkValidURL(data.page_url)
  if (!result) {
    return null
  }
  const pageData = await FindPageByIdOnly({ id: data.id })
  if (pageData) {
    if (pageData[0].is_default) {
      return null
    }
    if (pageData[0].page_url !== data.page_url) {
      data.page_url = await createValidURL(data.page_url, data.store_id)
    }
  }
  else {
    data.page_url = await createValidURL(data.page_url, data.store_id)
  }

  return DBHelper.updateData(data, "pages", "id")
}

exports.deletePage = async (query) => {
  const storeResult = await FindPageByIdOnly(query)
  const storeId = storeResult[0].store_id
  const key = `pages/${storeId}/${query.id}.json`;
  await fileService.deleteObjectByKey(key)
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

var getPagesByStoreId = exports.getPagesByStoreId = async (query) => {
  let condition = [];
  condition.push({ store_id: query.store_id })
  if (query.name) {
    condition.push({ [`UPPER(name)`]: { "OP.ILIKE": "%" + query.name.toUpperCase().trim() + "%" } })
  }
  if (query.is_default) {
    condition.push({ is_default: query.is_default })
  }
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
exports.saveHTMLFile = async (storeId, pageId, content) => {
  URLParser.saveHTMLFile(storeId, pageId, content)
};
exports.createHTMLFile = async (storeId, pageId, content) => {
  URLParser.createHTMLFile(storeId, pageId, content)
};
exports.removeHTMLFile = async (pageId) => {
  URLParser.removeHTMLFile(pageId)
}

exports.renameHTMLFile = async (pageId, newName) => {
  URLParser.renameHTMLFile(pageId, newName)
}

var getPagesByStoreIdAndId = exports.getPagesByStoreIdAndId = async (query) => {
  return DBHelper.getData("pages", query)
}
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

var FindPageByIdOnly = exports.FindPageByIdOnly = async (query) => {
  return DBHelper.getData("pages", query)
}
