const Joi = require('joi');

exports.validateAccount = (accountObj) => {
    var schema = Joi.object({
        email: Joi.string().email({ minDomainSegments: 2}).required(),
        password: (accountObj.gg_id || accountObj.fb_id) ? Joi.any() : Joi.string().min(8).max(30).required(),
        fullname: Joi.string().required(),
        phone: Joi.string().alphanum().length(10),
        gender: Joi.boolean(),
        dob: Joi.date(),
        fb_id: Joi.string(),
        gg_id: Joi.string()
    });
    return schema.validate(accountObj);
}

exports.validatePassword = (password) => {
    var schema = Joi.object({
        password: Joi.string().min(8).max(30).required()
    })
    return schema.validate({password: password});
}