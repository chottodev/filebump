const moment = require('moment');
const {constants: RESULT} = require('@filebump/utils');

let requestCounter = 0;

module.exports = (FileApiLog, Meta) => {
  async function get(req, res) {
    requestCounter++;
    const log = (...args) => {
      console.log(`[metadata:${requestCounter}]`, ...args);
    };
    
    try {
      const {fileId} = req.params;
      log('>>> get metadata for fileId:', fileId);
      
      if (!fileId) {
        await FileApiLog.create({
          date: moment().format('YYYY-MM-DD HH:mm:ss'),
          fileId: undefined,
          endpoint: req.originalUrl,
          result: RESULT.FAIL,
          subresult: 'fileId is required',
        });
        return res.status(400).json({status: 'FAIL', error: 'fileId is required'});
      }
      
      // Получаем все метаданные для fileId
      const metaRecords = await Meta.find({fileId});
      
      if (!metaRecords || metaRecords.length === 0) {
        await FileApiLog.create({
          date: moment().format('YYYY-MM-DD HH:mm:ss'),
          fileId,
          endpoint: req.originalUrl,
          result: RESULT.FAIL,
          subresult: 'Metadata not found',
        });
        return res.status(404).json({status: 'NOT FOUND', error: 'Metadata not found for this fileId'});
      }
      
      // Преобразуем массив записей в объект
      const metadata = {};
      metaRecords.forEach((record) => {
        metadata[record.key] = record.value;
      });
      
      log('metadata found:', Object.keys(metadata).length, 'keys');
      
      await FileApiLog.create({
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        fileId,
        endpoint: req.originalUrl,
        result: RESULT.OK,
        subresult: '',
      });
      
      res.json({
        status: RESULT.OK,
        fileId,
        metadata,
      });
    } catch (err) {
      log('error:', err);
      await FileApiLog.create({
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        fileId: req.params.fileId,
        endpoint: req.originalUrl,
        result: RESULT.FAIL,
        subresult: err.message || String(err),
      });
      res.status(500).json({status: 'FAIL', error: err.message || String(err)});
    }
  }
  
  get.apiDoc = {
    summary: 'Get file metadata',
    description: 'Retrieve metadata for a file by fileId',
    operationId: 'getFileMetadata',
    tags: ['files'],
    parameters: [
      {
        name: 'fileId',
        in: 'path',
        required: true,
        type: 'string',
        description: 'ID of the file to get metadata for',
      },
    ],
    responses: {
      200: {
        description: 'Metadata retrieved successfully',
        schema: {
          $ref: '#/definitions/File_metadata',
        },
      },
      400: {
        description: 'Bad request - fileId is required',
      },
      404: {
        description: 'Metadata not found',
      },
      500: {
        description: 'Internal server error',
      },
    },
  };
  
  return {
    get,
  };
};
