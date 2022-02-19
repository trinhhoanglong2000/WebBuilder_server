const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const productSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    pageId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
        //required: true,
    },
    type: {
        type: Number,
        default: -1
    },
    status: {
        type: Boolean,
        default: false
    },
    imageURL: {
        type: String,
        default: "",
    },
    price: {
        type: Number,
        default: 0
    }}, 
    {
        timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' }
    }
);

module.exports = mongoose.model('Product', productSchema);