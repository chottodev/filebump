const fs = require('fs/promises');
const path = require('path');
const config = require('../config');
const moment = require('moment');
const {constants: RESULT} = require('@filebump/utils');

let requestCounter = 0;

// Вспомогательная функция для получения метаданных из БД
const getMetadata = async (Meta, fileId) => {
  try {
    const metaRecords = await Meta.find({ fileId });
    const metadata = {};
    metaRecords.forEach((record) => {
      metadata[record.key] = record.value;
    });
    return metadata;
  } catch (err) {
    console.error('Error getting metadata from DB:', err);
    return {};
  }
};

module.exports = (FileApiLog, Meta) => {
  async function get(req, res) {
    requestCounter++;
    const log = (...args) => {
      console.log(`[file:${requestCounter}]`, ...args);
    };
    const baseUrl = '/' + req.originalUrl.split(('/'))[1];
    try {
      let isRequiredMp3 = false;
      const {fileId, fileName} = req.params;
      log('>>> get file', JSON.stringify({fileId, fileName}));
      const subDirId = fileId.substring(0, 4);
      const subDirPath = path.join(config.uploadDir, subDirId);
      let uploadPathFile = path.join(subDirPath, fileId);
      if (fileName && path.extname(fileName) === '.mp3') {
        uploadPathFile = uploadPathFile + '.mp3';
        log('required mp3 file', uploadPathFile);
        isRequiredMp3 = true;
      }
      try {
        await fs.access(uploadPathFile);
      } catch (err) {
        await FileApiLog.create({
          date: moment().format('YYYY-MM-DD HH:mm:ss'),
          fileId,
          endpoint: baseUrl,
          result: RESULT.FAIL,
          subresult: err,
        });
        res.status(404).json({status: 'NOT FOUND'});
        log('not found file', fileId);
        return;
      }
      // Получаем метаданные из БД вместо JSON файла
      const metadata = await getMetadata(Meta, fileId);
      log('metadata', metadata);
      
      // Определяем Content-Type с fallback
      let contentType = 'application/octet-stream'; // значение по умолчанию
      if (isRequiredMp3) {
        contentType = 'audio/mpeg';
      } else if (metadata.mimetype) {
        contentType = metadata.mimetype;
      } else {
        // Fallback: пытаемся определить по расширению файла
        const ext = path.extname(uploadPathFile).toLowerCase();
        const mimeTypes = {
          '.jpg': 'image/jpeg',
          '.jpeg': 'image/jpeg',
          '.png': 'image/png',
          '.gif': 'image/gif',
          '.pdf': 'application/pdf',
          '.mp3': 'audio/mpeg',
          '.mp4': 'video/mp4',
        };
        if (mimeTypes[ext]) {
          contentType = mimeTypes[ext];
        }
      }
      
      await FileApiLog.create({
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        fileId,
        endpoint: baseUrl,
        result: RESULT.OK,
        subresult: '',
      });
      res.sendFile(uploadPathFile, {
        headers: {
          'Content-Type': contentType,
        },
      });
    } catch (err) {
      log(err);
      await FileApiLog.create({
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        fileId,
        endpoint: baseUrl,
        result: RESULT.FAIL,
        subresult: err,
      });
      res.status(500).send();
    }
  }
  get.apiDoc = {
    summary: '',
    description: 'Upload a file and get a response',
    operationId: 'FileGet',
    tags: ['files'],
    responses: {
      200: {
        description: 'File found and returned successfully',
        schema: {
          $ref: '#/definitions/File',
        },
      },
      404: {
        description: 'File not found',
        schema: {
          $ref: '#/definitions/Error_Not_Found',
        },
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
