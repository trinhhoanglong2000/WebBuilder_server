const accountsModel = require('./accountModel');

exports.list = () => accountsModel.getAccounts();

exports.findAcc = async (username) => {
    var accs = await accountsModel.getAccounts();
    return accs.find(acc => acc.username == username);
}

exports.findAccWithMail = async (email) => {
    var accs = await accountsModel.getAccounts();
    return accs.find(acc => acc.email == email);
}

exports.updateInfoForOneField = async (field, infor, idObj) => {
    await accountsModel.updateInfoForOneField(field, infor, idObj);
}

exports.create = (accObj) => accountsModel.createAccount(accObj);

