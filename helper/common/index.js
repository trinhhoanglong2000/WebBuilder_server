
const storeService = require('../../api/stores/storeService');
const templateService = require('../../api/template/templateService')
const pageService = require('../../api/page/pageService')
const fse = require('fs-extra')
const fileService = require('../../api/files/fileService')
var generateURL = exports.generateURL = (s) => {
  return s.trim().toLowerCase().replace(/\s+/g, '-')
}
var capitalizeWord = (s) => {
  const arr = s.trim().toLowerCase().split("-")
  let returnData = ""
  for (let i = 0; i < arr.length; i++) {

    returnData += arr[i].charAt(0).toUpperCase() + arr[i].slice(1) + " ";
  }
  return returnData.trim()

}
exports.generateCode = () => {
  const now = Date.now();
  let cur = now;
  let token = "";

  while (cur !== 0) {
    let temp = cur % 10;
    token += String.fromCharCode(temp + 65);
    cur = Math.floor(cur / 10);
  }

  return token;
}

exports.generateCodeNumber = () => {
  const now = Date.now();
  let cur = now;
  let token = "";

  return cur;
}

exports.checkValidURL = (data) => {
  const check = data.match(/^\/[/.a-zA-Z0-9-]+$/gm)
  return check;
}

exports.saveHTMLFile = async (storeId, pageId, content) => {
  const storeName = await storeService.findById(storeId)

  //Get PageName
  let queryPage = {
    id: pageId,
    store_id: storeId
  }
  const PageName = await pageService.getPagesByStoreIdAndId(queryPage)
  let queryTemplate = {
    id: storeName.template_id
  }


  const templateName = await templateService.getTemplateById(queryTemplate)

  const storeNameConvert = storeName.name ? generateURL(storeName.name) : null;
  const pageNameConvert = PageName[0] ? generateURL(PageName[0].page_url) : null;



  //Create HTML FOOTER HEADER AND BODY

  const footer1 = content.html.match(/(?<=<\/main>)(?:.|\n)*/gm)[0]
  const header1 = content.html.match(/^<nav(?:.|\n)*<\/nav>/gm)[0]
  const main = content.html.match(/<main class=\"main-content\">(?:.|\n)*<\/main>/gm)[0]

  //Create HTML FOOTER HEADER
  const data = JSON.parse(await fileService.getFile(`storeComponents/${storeId}.json`))

  const footer = data["footer-html"]
  const header = data["header-html"]
  //Components
  let componentArr = []
  const _components = JSON.parse(content.components)


  const Main = _components.filter((value) => value.type == "Main")
  const mainComponents = Main[0] ? (Main[0].components ? Main[0].components : []) : []

  componentArr = [..._components.map((value) => capitalizeWord(value.type)), ...mainComponents.map((value) => capitalizeWord(value.type))]
  let css = ""
  let js = ""
  componentArr.forEach(value => {
    css += `<link id="${value}" href="../css/${templateName[0].name}/${value}.css" rel="stylesheet">
      `
    // css += `<link id="${value}" href="${process.env.SERVER_URL}/css/${templateName[0].name}/${value}.css" rel="stylesheet">
    // `
    js += `<script type="text/javascript" src="${process.env.SERVER_URL}/js/${templateName[0].name}/${value}.js" id="${value}" class="ScriptClass"></script>
      `
    // js += `<script type="text/javascript" src="${process.env.SERVER_URL}/js/${templateName[0].name}/${value}.js" id="${value}" class="ScriptClass"></script>
    // `
  })
  // <script type="text/javascript" src="http://localhost:5000/files/dist/js/template-default/Header.js" id="Header" class="ScriptClass"></script>
  if (storeNameConvert && pageNameConvert) {
    const HTML =
      `
        <body >
            ${main}
        </body>
      
        `
    const pageConfig = `
        ${css}
        <style>
          ${content.css}
        </style>
        ${js}
        `
    //HEADER HTML
    let key = `views/partials/${storeNameConvert}/header`
    fileService.uploadTextFileToS3(header, key, 'txt');

    // fse.outputFile(`views/partials/${storeNameConvert}/header.hbs`, header)
    //   .then(() => {
    //     console.log('Header File has been saved!');
    //   })
    //   .catch(err => {
    //     console.error(err)
    //   });

    //FOOTER HTML
    key = `views/partials/${storeNameConvert}/footer`
    fileService.uploadTextFileToS3(footer, key, 'txt');

    // fse.outputFile(`views/partials/${storeNameConvert}/footer.hbs`, footer)
    //   .then(() => {
    //     console.log('Footer File has been saved!');
    //   })
    //   .catch(err => {
    //     console.error(err)
    //   });

    //MAIN HTML
  
    key = `views/bodies/${storeNameConvert}${pageNameConvert}/index`
    fileService.uploadTextFileToS3(HTML, key, 'txt');

    // fse.outputFile(`views/bodies/${storeNameConvert}/${pageNameConvert}/index.hbs`, HTML)
    //   .then(() => {
    //     console.log('Body Main File has been saved!');
    //   })
    //   .catch(err => {
    //     console.error(err)
    //   });

    //CONFIG HTML
    key = `views/partials/${storeNameConvert}/pages${pageNameConvert}/index`
    fileService.uploadTextFileToS3(pageConfig, key, 'txt');

    // fse.outputFile(`views/partials/${storeNameConvert}/pages/${pageNameConvert}/index.hbs`, pageConfig)
    //   .then(() => {
    //     console.log('Body Config File has been saved!');
    //   })
    //   .catch(err => {
    //     console.error(err)
    //   });
  }
};

exports.createConfigHTML = async (storeId, link = "") => {
  const storeName = await storeService.findById(storeId)
  const storeNameConvert = storeName.name ? generateURL(storeName.name) : null;
  const HTML = `
    <title>${storeName.name}</title>
    <script type="text/javascript" src="https://code.jquery.com/jquery-3.6.0.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.2/dist/umd/popper.min.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
    <link rel="stylesheet" href="https://cdn.quilljs.com/1.3.6/quill.snow.css">
    <link rel="icon" type="image/x-icon" href="${link}">
                `



  const key = `views/partials/${storeNameConvert}/config`
  fileService.uploadTextFileToS3(HTML, key, 'txt');

  // fileService.uploadTextFileToS3()
  // fse.outputFile(`views/partials/${storeNameConvert}/config.hbs`, HTML)
  //   .then(() => {
  //     console.log('The file config has been saved!');
  //   })
  //   .catch(err => {
  //     console.error(err)
  //   });
}

exports.getTime = () => {
  const today = new Date()
  const date = today.getUTCFullYear() + '-' + (today.getUTCMonth() + 1) + '-' + today.getUTCDate();
  const time = today.getUTCHours() + ":" + today.getUTCMinutes() + ":" + today.getUTCSeconds();
  const dateTime = date + ' ' + time;
  return dateTime
}