const pageService = require('./pageService');

exports.create = async (req, res) => {
    const pageBody = req.body;
    const page = await pageService.createPage(pageBody);
    res.json(page);
};

exports.changeContent = async (req, res) => {
    const pageId = req.params.pageId;
    const pageContent = await pageService.savePageContent(pageId, req.body);
    res.json(pageContent);
};

exports.loadContent = async (req, res) => {
    const pageId = req.params.pageId;
    const pageData = await pageService.findPageById(pageId);
    res.json(pageData.content);
}