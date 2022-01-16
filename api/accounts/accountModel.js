const db = require("../../database");

const Account = (acc) => {
    this.username = acc.username;
    this.password = acc.password;
}


Account.getAccounts = () => db.execute(
    "SELECT *" 
    + "FROM accounts");
Account.createAccount = (accObj) => db.execute(
    "INSERT INTO accounts (username, password, googleID, facebookID, email) "
    + `VALUES ('${accObj.username}', '${accObj.password}', '${accObj.googleID}', '${accObj.facebookID}', '${accObj.email}')`);

Account.updateInfoForOneField = (field, infor, idOfobj) => db.execute(
    `UPDATE accounts SET ${field} ='${infor}' WHERE id = '${idOfobj}'`);


module.exports = Account;