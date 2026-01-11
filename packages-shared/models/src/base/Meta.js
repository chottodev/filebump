const mongoose = require('mongoose');

const MetaSchema = new mongoose.Schema({
  fileId: {
    type: String,
    required: true,
    index: true,
  },
  key: {
    type: String,
    required: true,
  },
  value: {
    type: String,
    required: true,
  },
});

// Составной индекс для быстрого поиска по fileId и key
MetaSchema.index({ fileId: 1, key: 1 }, { unique: true });

module.exports = {
  MetaSchema,
};
