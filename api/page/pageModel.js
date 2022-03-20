const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const pageSchema = new mongoose.Schema(
    {
      _id: mongoose.Schema.Types.ObjectId,
      storeId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
      },
      name: {
        type: String,
        required: true
      },
      contentURL: {
        type: String,
        default: ""
      }
    }, {
      timestamps: { createdAt: 'createAt', updatedAt: 'updateAt' }
    }
);

module.exports = mongoose.model('Page', pageSchema);