const fs = require('fs/promises');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const moment = require('moment');
const {constants: RESULT} = require('@filebump/utils');
const config = require('../config');

const {getId} = require('../getId');

const prepareMetadata = (uploadedFile) => {
  return {
    name: uploadedFile.name,
    mimetype: uploadedFile.mimetype,
    md5: uploadedFile.md5,
    size: uploadedFile.size,
    dateCreated: (+new Date() / 1000).toFixed(0),
  };
};

/**
 * Санитизация ключей метаданных
 * Разрешает только буквы, цифры, дефисы, подчеркивания
 * Максимальная длина 100 символов
 */
const sanitizeMetadataKey = (key) => {
  if (typeof key !== 'string') {
    return null;
  }
  // Удаляем все символы кроме букв, цифр, дефисов и подчеркиваний
  const sanitized = key.replace(/[^a-zA-Z0-9_-]/g, '');
  // Ограничиваем длину
  if (sanitized.length === 0 || sanitized.length > 100) {
    return null;
  }
  return sanitized;
};

/**
 * Санитизация значений метаданных
 * Защита от опасных символов и инъекций
 * Максимальная длина 10000 символов
 * 
 * Примечание: HTML-экранирование не выполняется при сохранении в БД,
 * это нужно делать при выводе данных в HTML
 */
const sanitizeMetadataValue = (value) => {
  if (value === null || value === undefined) {
    return '';
  }
  
  const strValue = String(value);
  
  // Ограничиваем длину
  if (strValue.length > 10000) {
    return strValue.substring(0, 10000);
  }
  
  // Удаляем управляющие символы (нулевые байты, переводы строк и т.д.)
  // которые могут быть опасными при сохранении в БД
  // Разрешаем обычные символы Unicode для поддержки разных языков
  const sanitized = strValue.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  
  return sanitized;
};

/**
 * Извлекает и санитизирует дополнительные метаданные из req.body
 * Исключает служебные поля (file, fileId)
 */
const extractCustomMetadata = (body) => {
  const customMetadata = {};
  const excludedKeys = ['file', 'fileId']; // Служебные поля, которые не должны быть метаданными
  
  if (!body || typeof body !== 'object') {
    return customMetadata;
  }
  
  for (const [key, value] of Object.entries(body)) {
    // Пропускаем служебные поля
    if (excludedKeys.includes(key)) {
      continue;
    }
    
    const sanitizedKey = sanitizeMetadataKey(key);
    if (!sanitizedKey) {
      continue; // Пропускаем невалидные ключи
    }
    
    const sanitizedValue = sanitizeMetadataValue(value);
    customMetadata[sanitizedKey] = sanitizedValue;
  }
  
  return customMetadata;
};

const postUploadAction = async (metadata) => {
  if (metadata.mimetype !== 'audio/ogg' &&
    metadata.mimetype !== 'audio/mpeg' &&
    metadata.mimetype !== 'audio/wave') {
    return console.log(
        `${metadata.mimetype}: post actions for uploaded mimetype is not defined`,
    );
  }

  if (metadata.mimetype === 'audio/ogg' ||
    metadata.mimetype === 'audio/mpeg'||
    metadata.mimetype === 'audio/wave') {
    console.log(`${metadata.mimetype}: start post upload action`);
    const fileId = metadata.fileId;

    const subDirId = fileId.substring(0, 4);

    const subDirPath = path.join(config.uploadDir, subDirId);
    await fs.mkdir(subDirPath, {recursive: true});

    const uploadPathFile = path.join(subDirPath, fileId);
    const {stdout, stderr} = await exec(
        `ffmpeg -i ${uploadPathFile} ${uploadPathFile}.mp3`,
    );
    console.log(stdout, stderr);
  }
};

// Вспомогательная функция для сохранения метаданных в БД
const saveMetadata = async (Meta, fileId, metadata) => {
  const metadataEntries = Object.entries(metadata);
  const promises = metadataEntries.map(([key, value]) => {
    return Meta.findOneAndUpdate(
      { fileId, key },
      { fileId, key, value: String(value) },
      { upsert: true, new: true }
    );
  });
  await Promise.all(promises);
};

module.exports = (FileApiLog, File, Meta) => {
  let requestCounter = 0;
  async function post(req, res) {
    requestCounter++;
    const log = (...args) => {
      console.log(`[upload:${requestCounter}]`, ...args);
    };
    if (!req.files || Object.keys(req.files).length === 0) {
      log('no file');
      await FileApiLog.create({
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        fileId: undefined,
        endpoint: req.baseUrl,
        result: RESULT.FAIL,
        subresult: 'No files were uploaded',
      });
      return res.status(400).send('No files were uploaded.');
    }

    // const key = req.get(authHeader);
    // log('upload with key', key);
    const key = 'key';

    log('external fileId:', req.query.fileId);

    const fileId = req.query.fileId ? req.query.fileId : getId();
    const uploadedFile = req.files.file;

    const subDirId = fileId.substring(0, 4);

    const subDirPath = path.join(config.uploadDir, subDirId);
    try {
      await fs.mkdir(subDirPath, {recursive: true});

      const uploadPathFile = path.join(subDirPath, fileId);

      // Извлекаем и санитизируем дополнительные метаданные из req.body
      const customMetadata = extractCustomMetadata(req.body);
      log('custom metadata from request:', JSON.stringify(customMetadata));

      const metadata = {
        ...prepareMetadata(uploadedFile),
        fileId,
        key,
        ...customMetadata, // Добавляем пользовательские метаданные
      };
      log('metadata', JSON.stringify(metadata));

      await uploadedFile.mv(uploadPathFile);
      // Сохраняем метаданные в БД вместо JSON файла
      await saveMetadata(Meta, fileId, metadata);
      log('metadata saved to DB for fileId:', fileId);

      const resData = {
        fileId,
        url: `${config.baseUrl}/file/${fileId}`,
        status: RESULT.OK,
      };
      await File.create({
        fileId: resData.fileId,
        filename: uploadedFile.name,
        mimetype: uploadedFile.mimetype,
        dateCreated: moment().format('YYYY-MM-DD HH:mm:ss'),
      });

      await FileApiLog.create({
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        fileId: resData.fileId,
        endpoint: req.originalUrl,
        result: RESULT.OK,
        subresult: '',
      });

      log('<<< response', resData);
      res.json(resData);
      await postUploadAction(metadata);
    } catch (err) {
      log(err);
      await FileApiLog.create({
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        fileId,
        endpoint: req.originalUrl,
        result: RESULT.FAIL,
        subresult: err,
      });
      res.status(500).send(err);
    }
    console.log('post');
  }

  post.apiDoc = {
    summary: 'Upload a file',
    description: 'Upload a file and get a response',
    operationId: 'fileUpload',
    tags: ['files'],
    parameters: [
      {
        name: 'file',
        in: 'formData',
        required: true,
        type: 'file',
        description: 'The file to upload',
      },
      {
        name: 'fileId',
        in: 'query',
        type: 'string',
        description: 'Optional file ID',
      },
    ],
    responses: {
      200: {
        description: 'File uploaded successfully',
        schema: {
          $ref: '#/definitions/File_upload',
        },
      },
      400: {
        description: 'No files were uploaded',
      },
      500: {
        description: 'Internal server error',
      },
    },
  };

  return {
    post,
  };
};
