const fileName = require('./fileHandler.js');

module.exports = (FileApiLog, Meta, File) => {
  return {
    parameters: [
      {
        name: 'fileId',
        in: 'path',
        required: true,
        type: 'string',
        description: 'ID of the file to retrieve',
      },
    ],
    get: fileName(FileApiLog, Meta, File).get,
  };
};
