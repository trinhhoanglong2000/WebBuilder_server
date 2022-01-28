const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const accountSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        //required: true,
    },
    fullname: {
        type: String,
        required: true,
    },
    phone: String,
    gender: {
        type: Boolean,
        default: true
    },
    DOB: {
        type: Date,
        default: null
    },
    fbID: {
        type: String,
        default: null
    },
    ggID: {
        type: String,
        default: null
    },
    isActive: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Account', accountSchema);