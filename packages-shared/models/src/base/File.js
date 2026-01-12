const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  fileId: {type: String, required: true, index: true},
  filename: {type: String},
  mimetype: {type: String},
  createdAt: {type: String},
  bucketId: {type: String, default: 'default', index: true},
  filepath: {type: String, required: true}, // {bucketId}/{YYYY-MM-DD}/{fileId}
  extension: {type: String}, // расширение файла (например, .png, .jpg)
});

module.exports = {
  FileSchema,
};
