const mongoose = require('mongoose');

mongoose.Promise = global.Promise;

const pageSchema = new mongoose.Schema(
    {
        name: {
          type: String,
          required: true,
          trim: true,
          maxlength: 25,
        },
        slug: {
          type: String,
          required: true,
        },
        content: Object,
    },
    {
        timestamps: true,
    },
);

module.exports = mongoose.model('Page', pageSchema);