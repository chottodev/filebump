const moment = require('moment');
const fs = require('fs/promises');
const path = require('path');
const config = require('../config');
const axios = require('axios');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const {performance} = require('node:perf_hooks');
const {constants: RESULT} = require('@filebump/utils');

const {MimeType} = require('mime-type');
const db = require('mime-db');
const mimeTypes = require('mime-types');

const {getId} = require('../getId.js');

const authHeader = config.authHeader || 'X-API-Key';

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
 * Исключает служебные поля (url, fileId, bucketId)
 */
const extractCustomMetadata = (body) => {
  const customMetadata = {};
  const excludedKeys = ['url', 'fileId', 'bucketId']; // Служебные поля, которые не должны быть метаданными
  
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

/**
 * Исправляет кодировку имени файла
 * Проблема: имена файлов с кириллицей могут приходить в неправильной кодировке
 * Решение: декодируем из latin1 в utf8, если имя файла содержит невалидные UTF-8 символы
 */
const fixFilenameEncoding = (filename) => {
  if (!filename || typeof filename !== 'string') {
    return filename;
  }
  
  try {
    // Проверяем, является ли строка валидным UTF-8
    const isValidUtf8 = Buffer.from(filename, 'utf8').toString('utf8') === filename;
    if (isValidUtf8) {
      return filename;
    }
    
    // Пытаемся декодировать из latin1 (ISO-8859-1) в UTF-8
    // Это часто помогает, когда кириллица была неправильно интерпретирована
    const decoded = Buffer.from(filename, 'latin1').toString('utf8');
    
    // Проверяем, что декодирование дало валидный результат
    // (не содержит replacement characters)
    if (decoded && !decoded.includes('\uFFFD')) {
      return decoded;
    }
    
    // Если декодирование не помогло, возвращаем оригинал
    return filename;
  } catch (err) {
    // Если ошибка декодирования, используем оригинальное имя
    console.error('filename decode error:', err);
    return filename;
  }
};

let requestCounter = 0;
let requestFailCounter = 0;

// подстройка mime types
const mime = new MimeType(db);

mime.define('application/cdr', {extensions: ['cdr']}, mime.dupAppend);
mime.define('image/x-ms-bmp', {extensions: ['bmp']}, mime.dupAppend);

mime.clear('image/jpeg');
mime.define('image/jpeg', {extensions: ['jpeg']}, mime.dupAppend);

mime.clear('video/mp4');
mime.define('video/mp4', {extensions: ['mp4']}, mime.dupAppend);
// конец подстройки

function getExtensionFromLink(link) {
  const result = link.match(/\.(.{3,4})$/);
  return result?.[1];
}

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

const postUploadAction = async (fileRecord) => {
  if (fileRecord.mimetype !== 'audio/ogg' && fileRecord.mimetype !== 'audio/mpeg') {
    return console.log(
        `${fileRecord.mimetype}: post actions for uploaded mimetype is not defined`,
    );
  }

  if (fileRecord.mimetype === 'audio/ogg' || fileRecord.mimetype === 'audio/mpeg') {
    console.log(`${fileRecord.mimetype}: start post upload action`);
    
    // Используем новый путь: {uploadDir}/{filepath}{extension}
    const uploadPathFile = path.join(config.uploadDir, fileRecord.filepath + (fileRecord.extension || ''));
    const mp3PathFile = uploadPathFile + '.mp3';
    
    const {stdout, stderr} = await exec(
        `ffmpeg -i ${uploadPathFile} ${mp3PathFile}`,
    );
    console.log(stdout, stderr);
  }
};

module.exports = (FileApiLog, File, Meta, Bucket) => {
  async function post(req, res) {
    console.log('post /download');
    const startTime = performance.now();
    requestCounter++;
    const log = (...args) => {
      console.log(`[download:${requestCounter}]`, ...args);
    };
    const downloadUrl = req.body.url;
    const fileId = req.body.fileId ? req.body.fileId : getId();

    try {
      const key = req.get(authHeader);
      log('>>> request', {key, fileId, downloadUrl});
      const resData = {
        fileId,
        url: `${config.baseUrl}/file/${fileId}`,
        status: 'DOWNLOAD',
      };
      //  log('<<< response:', resData);
      //  res.json(resData);
      // дополнительный head запрос для анализа заголовка 'content-disposition'
      const preResp = await axios.head(downloadUrl);
      const filenameReg = /filename="(.+?)"/;
      const targetHeader = preResp.headers?.['content-disposition'];
      let mimeType;
      // если заголовок есть -> анализ имени файла и расширения
      if (targetHeader) {
        const fileName = targetHeader.match(filenameReg)?.[1] || '';
        log('fileName in header', fileName);
        // имя файла из заголовка возвращается в ответе на тг-централ
        if (fileName) resData.fileName = fileName;
        const fileExtension = getExtensionFromLink(fileName);
        log('fileExtension', fileExtension);
        mimeType = (fileExtension) ? mime.lookup(fileExtension) : null;
        log('finded mimeType', mimeType);
      }
      // возврат результата
      log('<<< response:', resData);
      res.json(resData);

      const response = await axios.get(downloadUrl, {responseType: 'arraybuffer'});
      const date = new Date();
      
      // Извлекаем имя файла из заголовка, если есть
      let filename = targetHeader ? targetHeader.match(filenameReg)?.[1] : null;
      // Исправляем кодировку имени файла (если пришло в неправильной кодировке)
      if (filename) {
        filename = fixFilenameEncoding(filename);
        log('original filename from header:', targetHeader.match(filenameReg)?.[1], 'fixed filename:', filename);
      }
      const mimetype = (mimeType) ? mimeType : response.headers['content-type'];
      
      // Извлекаем bucketId из req.body или используем 'default'
      const bucketId = req.body.bucketId || 'default';
      
      // Извлекаем и санитизируем дополнительные метаданные из req.body
      // Исключаем служебные поля: url, fileId, bucketId
      const customMetadata = extractCustomMetadata(req.body);
      log('custom metadata from request:', JSON.stringify(customMetadata));
      
      // В метаданные сохраняем только пользовательские поля
      // fileId, mimetype, createdAt - сохраняются в модели File
      // bucketId - сохраняется в модели File
      // key - служебное поле, не сохраняем в метаданные
      const metadata = {
        downloadUrl, // URL источника может быть полезен
        ...customMetadata, // Добавляем пользовательские метаданные
      };
      log('metadata to save:', JSON.stringify(metadata));

      // Получаем дату в формате YYYY-MM-DD
      const dateDir = moment().format('YYYY-MM-DD');
      
      // Получаем расширение файла
      const extension = filename ? path.extname(filename).toLowerCase() : (mimetype ? '.' + mimeTypes.extension(mimetype) : '');
      
      // Формируем путь: {bucketId}/{YYYY-MM-DD}/{fileId}.{extension}
      const filepath = `${bucketId}/${dateDir}/${fileId}`;
      const fullFilePath = path.join(config.uploadDir, filepath);
      const uploadPathFile = fullFilePath + (extension || '');
      
      // Создаем директории если их нет
      const uploadDir = path.dirname(uploadPathFile);
      await fs.mkdir(uploadDir, {recursive: true});

      await fs.writeFile(uploadPathFile, response.data, {encoding: 'binary'});
      // Сохраняем метаданные в БД вместо JSON файла
      await saveMetadata(Meta, fileId, metadata);
      
      // Сохраняем данные файла в модель File
      await File.create({
        fileId,
        filename: filename || null,
        mimetype: mimetype || null,
        createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        bucketId: bucketId,
        filepath: filepath, // {bucketId}/{YYYY-MM-DD}/{fileId}
        extension: extension || '',
      });
      
      // Создаем или обновляем Bucket
      await Bucket.findOneAndUpdate(
        { bucketId },
        { bucketId, createdAt: moment().format('YYYY-MM-DD HH:mm:ss') },
        { upsert: true, new: true }
      );

      await FileApiLog.create({
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        fileId: fileId,
        endpoint: req.originalUrl,
        result: RESULT.OK,
        subresult: '',
      });
      log('file download success', fileId);
      
      // Получаем созданную запись File для postUploadAction
      const fileRecord = await File.findOne({ fileId });
      await postUploadAction(fileRecord);
    } catch (err) {
      requestFailCounter++;
      await FileApiLog.create({
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        fileId,
        endpoint: req.originalUrl,
        result: RESULT.FAIL,
        subresult: err,
      });
      log('download, failCounter:', requestFailCounter);
      log('download, catch err', err);
    }
    const duration = Number((performance.now() - startTime) / 1000).toFixed(2);
    log('performance:', duration);
  }
  post.apiDoc = {
    summary: 'Download a file',
    description: 'Send url get a response',
    operationId: 'fileDownload',
    tags: ['file-upload'],
    parameters: [],
    responses: {
      200: {
        description: 'Success',
        schema: {
          $ref: '#/definitions/File_download',
        },
      },
      400: {
        description: 'Bad request',
      },
      500: {
        description: 'Internal server error',
      },
    },
  };
  return {
    parameters: [
      {
        in: 'body',
        name: 'body',
        schema: {
          '$ref': '#/definitions/File_download',
        },
      },
    ],
    post,
  };
};
