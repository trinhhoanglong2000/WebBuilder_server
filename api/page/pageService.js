const DBHelper = require('../../helper/DBHelper/DBHelper');
const storeService = require('../stores/storeService');
const templateService = require('../template/templateService')
const AWS = require('aws-sdk');
const URLParser = require('../../helper/common')

const s3 = new AWS.S3();

const db = require('../../database');
const { v4: uuidv4 } = require('uuid');
const fse = require('fs-extra')

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
exports.saveHTMLFile = async (storeId, pageId, content) => {
  const storeName = await storeService.findById(storeId)

  //Get PageName
  let queryPage = {
    id: pageId,
    store_id: storeId
  }
  const PageName = await getPagesByStoreIdAndId(queryPage)
  let queryTemplate = {
    id: storeName.template_id
  }
  const templateName = await templateService.getTemplateById(queryTemplate)
  const storeNameConvert = storeName.name ? URLParser.generateURL(storeName.name) : null;
  const pageNameConvert = PageName[0] ? URLParser.generateURL(PageName[0].name) : null;

  //Components
  let componentArr = []
  const _components = JSON.parse(content.components)
  const Main = _components.filter((value) => value.name == "Main")
  const mainComponents = Main[0] ? Main[0].components : []
  componentArr = [..._components.map((value) => value.name), ...mainComponents.map((value) => value.name)]
  let css = ""
  let js = ""
  componentArr.forEach(value => {
    css += `<link id="${value}" href="${process.env.SERVER_URL}/css/${templateName[0].name}/${value}.css" rel="stylesheet">
    `
    js += `<script type="text/javascript" src="${process.env.SERVER_URL}/js/${templateName[0].name}/${value}.js" id="${value}" class="ScriptClass"></script>
    `
  })
  // <script type="text/javascript" src="http://localhost:5000/files/dist/js/template-default/Header.js" id="Header" class="ScriptClass"></script>
  if (storeNameConvert && pageNameConvert) {
    const HTML =
      `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${storeName.name}</title>
          <script type="text/javascript" src="https://code.jquery.com/jquery-3.6.0.js"></script>
          <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"></script>
          <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js"></script>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
          <link rel="stylesheet" href="https://cdn.quilljs.com/1.3.6/quill.snow.css">
          ${css}
      </head>
      <style>
        ${content.css}
      </style>
      <body >
          ${content.html}
      </body>
      ${js}

      </html>
      `
    fse.outputFile(`stores/${storeNameConvert}/${pageNameConvert}/index.html`, HTML)
      .then(() => {
        console.log('The file has been saved!');
      })
      .catch(err => {
        console.error(err)
      });


  }
};
exports.createHTMLFile = async (storeId, pageId, content) => {
  const storeName = await storeService.findById(storeId)

  //Get PageName
  let queryPage = {
    id: pageId,
    store_id: storeId
  }
  const PageName = await getPagesByStoreIdAndId(queryPage)
  let queryTemplate = {
    id: storeName.template_id
  }
  const templateName = await templateService.getTemplateById(queryTemplate)
  const storeNameConvert = storeName.name ? URLParser.generateURL(storeName.name) : null;
  const pageNameConvert = PageName[0] ? URLParser.generateURL(PageName[0].name) : null;

  // <script type="text/javascript" src="http://localhost:5000/files/dist/js/template-default/Header.js" id="Header" class="ScriptClass"></script>
  if (storeNameConvert && pageNameConvert) {
    const HTML =
      `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${storeName.name}</title>
          <script type="text/javascript" src="https://code.jquery.com/jquery-3.6.0.js"></script>
          <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"></script>
          <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js"></script>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
          <link rel="stylesheet" href="https://cdn.quilljs.com/1.3.6/quill.snow.css">
         
      </head>
      <style>
        
      </style>
      <body >
        
      </body>
      
      </html>
      `
    fse.outputFile(`stores/${storeNameConvert}/${pageNameConvert}/index.html`, HTML)
      .then(() => {
        console.log('The file has been saved!');
      })
      .catch(err => {
        console.error(err)
      });


  }
};
exports.removeHTMLFile = async (pageId) => {
  let query = { id: pageId }
  const storeResult = await FindPageByIdOnly(query)
  const storeId = storeResult[0].store_id
  const storeName = await storeService.findById(storeId)

  //Get PageName
  let queryPage = {
    id: pageId,
    store_id: storeId
  }
  const PageName = await getPagesByStoreIdAndId(queryPage)

  const storeNameConvert = storeName.name ? URLParser.generateURL(storeName.name) : null;
  const pageNameConvert = PageName[0] ? URLParser.generateURL(PageName[0].name) : null;

  fse.rm(`stores/${storeNameConvert}/${pageNameConvert}`, { recursive: true, force: true })
    .then(() => {
      console.log('The file has been saved!');
    })
    .catch(err => {
      console.error(err)
    });
}

exports.renameHTMLFile = async (pageId, newName) => {
  let query = { id: pageId }
  const storeResult = await FindPageByIdOnly(query)
  const storeId = storeResult[0].store_id
  const storeName = await storeService.findById(storeId)

  //Get PageName
  let queryPage = {
    id: pageId,
    store_id: storeId
  }
  const PageName = await getPagesByStoreIdAndId(queryPage)

  const storeNameConvert = storeName.name ? URLParser.generateURL(storeName.name) : null;
  const pageNameConvert = PageName[0] ? URLParser.generateURL(PageName[0].name) : null;
  const newPageNameConvert = URLParser.generateURL(newName)
  if (`stores/${storeNameConvert}/${pageNameConvert}`) {
    fse.rename(`stores/${storeNameConvert}/${pageNameConvert}`, `stores/${storeNameConvert}/${newPageNameConvert}`)
      .then(() => {
        console.log('The file has been saved!');
      })
      .catch(err => {
        console.error(err)
      });
  }
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