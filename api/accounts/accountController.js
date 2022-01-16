const accountService = require('./accountService');

exports.list = async function(req, res) {
    const accs = await accountService.list();

    if (accs) {
        res.status(200).json(accs);
    } else {
        res.status(404).json({message: 'No accounts available!'});
    }
};

exports.create = async function(req, res) {
    const newAcc = req.body;
    const result = await accountService.create(newAcc);

    if (result) {
        res.status(201).json({message: 'Account created!', id: result.insertId});
    } else {
        res.status(500).json({message: 'Error Account class!'});
    }
};

    