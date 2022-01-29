const Pages = require('./pageModel');

exports.createPage = (pageBody) => {
    const slug = pageBody.name.toLowerCase().split(' ').join('-');
    pageBody.slug = slug;
    const page = new Pages(pageBody);
    return page.save();
};

exports.listPages = () => {
    return Pages.find({});
};

exports.savePageContent = (pageId, content) => {
    return Pages.findOneAndUpdate({ ok: 1 }, { content });
};

exports.findPageById = (pageId) => {
    return Pages.findOne({ok: 1});
};