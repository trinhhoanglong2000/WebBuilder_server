const mongoose = require('mongoose');
const Joi = require('joi');

mongoose.Promise = global.Promise;

const accountSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  fullname: {
    type: String,
    required: true,
  },
  phone: String,
  gender: {
      type: Boolean,
      required: true
  },
  DOB: {
      type: Date,
    //   required: true
  }
});

// accountSchema.methods.joiValidate = (accountObj) => {
//     var schema = {
//         email: Joi.string().required(),
//         password: Joi.string().min(8).max(30).pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
//         phone: Joi.string().,
//         gender: ,
//         DOB: 
//     }
// }

module.exports = mongoose.model('Account', accountSchema);