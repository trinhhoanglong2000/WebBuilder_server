const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const storeSchema = new mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
        //required: true,
    }}, 
    {
        timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' }
    }
);

module.exports = mongoose.model('Store', storeSchema);