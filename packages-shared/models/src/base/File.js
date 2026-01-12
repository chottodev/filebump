const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  fileId: {type: String, required: true, index: true},
  filename: {type: String},
  mimetype: {type: String},
  dateCreated: {type: String},
});

module.exports = {
  FileSchema,
};
