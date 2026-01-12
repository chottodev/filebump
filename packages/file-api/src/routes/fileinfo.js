const moment = require('moment');
const {constants: RESULT} = require('@filebump/utils');

let requestCounter = 0;

module.exports = (FileApiLog, File, Meta) => {
  async function get(req, res) {
    requestCounter++;
    const log = (...args) => {
      console.log(`[fileinfo:${requestCounter}]`, ...args);
    };
    
    try {
      const {fileId} = req.params;
      log('>>> get fileinfo for fileId:', fileId);
      
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
      
      // Получаем данные файла из модели File
      const file = await File.findOne({fileId});
      
      if (!file) {
        await FileApiLog.create({
          date: moment().format('YYYY-MM-DD HH:mm:ss'),
          fileId,
          endpoint: req.originalUrl,
          result: RESULT.FAIL,
          subresult: 'File not found',
        });
        return res.status(404).json({status: 'NOT FOUND', error: 'File not found'});
      }
      
      // Получаем все метаданные для fileId из модели Meta
      const metaRecords = await Meta.find({fileId});
      
      // Преобразуем массив записей в объект
      const meta = {};
      metaRecords.forEach((record) => {
        meta[record.key] = record.value;
      });
      
      log('fileinfo found:', fileId, 'meta keys:', Object.keys(meta).length);
      
      await FileApiLog.create({
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        fileId,
        endpoint: req.originalUrl,
        result: RESULT.OK,
        subresult: '',
      });
      
      // Формируем ответ с данными файла и метаданными
      res.json({
        status: RESULT.OK,
        fileId: file.fileId,
        filename: file.filename,
        mimetype: file.mimetype,
        createdAt: file.createdAt,
        bucketId: file.bucketId,
        meta,
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
    summary: 'Get file information',
    description: 'Retrieve file information and metadata by fileId',
    operationId: 'getFileInfo',
    tags: ['files'],
    parameters: [
      {
        name: 'fileId',
        in: 'path',
        required: true,
        type: 'string',
        description: 'ID of the file to get information for',
      },
    ],
    responses: {
      200: {
        description: 'File information retrieved successfully',
        schema: {
          $ref: '#/definitions/File_info',
        },
      },
      400: {
        description: 'Bad request - fileId is required',
      },
      404: {
        description: 'File not found',
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
