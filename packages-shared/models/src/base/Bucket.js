const mongoose = require('mongoose');

const BucketSchema = new mongoose.Schema({
  bucketId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  createdAt: {
    type: String,
    required: true,
  },
});

module.exports = {
  BucketSchema,
};
