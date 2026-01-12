const fs = require('fs/promises');
const path = require('path');
const util = require('util');
const exec = util.promisify(require('child_process').exec);
const moment = require('moment');
const {constants: RESULT} = require('@filebump/utils');
const config = require('../config');
const mime = require('mime-types');

const {getId} = require('../getId');

/**
 * Получает расширение файла из имени файла или mimetype
 */
const getFileExtension = (filename, mimetype) => {
  // Сначала пытаемся получить из имени файла
  if (filename) {
    const ext = path.extname(filename).toLowerCase();
    if (ext) {
      return ext;
    }
  }
  
  // Если нет расширения в имени, пытаемся получить из mimetype
  if (mimetype) {
    const ext = mime.extension(mimetype);
    if (ext) {
      return '.' + ext;
    }
  }
  
  // Если ничего не найдено, возвращаем пустую строку
  return '';
};

/**
 * Исправляет кодировку имени файла
 * Проблема: express-fileupload может неправильно обрабатывать имена файлов с кириллицей
 * Решение: пытаемся декодировать из разных кодировок в UTF-8
 */
const fixFilenameEncoding = (filename) => {
  if (!filename || typeof filename !== 'string') {
    return filename;
  }
  
  try {
    // Проверяем, содержит ли строка символы, которые выглядят как неправильно закодированная кириллица
    // Паттерн: последовательности типа "Ð" или "Ð¾" - это признаки неправильной кодировки
    const hasEncodingIssue = /Ð|Ñ|Ð|Ñ/.test(filename);
    
    if (!hasEncodingIssue) {
      // Если нет признаков проблемы с кодировкой, проверяем валидность UTF-8
      try {
        Buffer.from(filename, 'utf8');
        return filename; // Валидный UTF-8
      } catch (e) {
        // Невалидный UTF-8, попробуем декодировать
      }
    }
    
    // Пытаемся декодировать из latin1 (ISO-8859-1) в UTF-8
    // Это часто помогает, когда кириллица была неправильно интерпретирована как latin1
    const decoded = Buffer.from(filename, 'latin1').toString('utf8');
    
    // Проверяем, что декодирование дало валидный результат
    // (не содержит replacement characters и выглядит как правильная кириллица)
    if (decoded && !decoded.includes('\uFFFD')) {
      // Проверяем, что результат содержит кириллические символы (если исходная строка их содержала)
      const hasCyrillic = /[А-Яа-яЁё]/.test(decoded);
      if (hasCyrillic || !hasEncodingIssue) {
        return decoded;
      }
    }
    
    // Если декодирование не помогло, возвращаем оригинал
    return filename;
  } catch (err) {
    // Если ошибка декодирования, используем оригинальное имя
    console.error('filename decode error:', err);
    return filename;
  }
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
  const excludedKeys = ['file', 'fileId', 'bucketId']; // Служебные поля, которые не должны быть метаданными
  
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

const postUploadAction = async (fileRecord) => {
  if (fileRecord.mimetype !== 'audio/ogg' &&
    fileRecord.mimetype !== 'audio/mpeg' &&
    fileRecord.mimetype !== 'audio/wave') {
    return console.log(
        `${fileRecord.mimetype}: post actions for uploaded mimetype is not defined`,
    );
  }

  if (fileRecord.mimetype === 'audio/ogg' ||
    fileRecord.mimetype === 'audio/mpeg'||
    fileRecord.mimetype === 'audio/wave') {
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

module.exports = (FileApiLog, File, Meta, Bucket) => {
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

    // Извлекаем bucketId из req.body или используем 'default'
    const bucketId = req.body.bucketId || 'default';
    
    // Получаем дату в формате YYYY-MM-DD
    const dateDir = moment().format('YYYY-MM-DD');
    
    // Получаем расширение файла
    const filename = fixFilenameEncoding(uploadedFile.name);
    const extension = getFileExtension(filename, uploadedFile.mimetype);
    
    // Формируем путь: {bucketId}/{YYYY-MM-DD}/{fileId}.{extension}
    const filepath = `${bucketId}/${dateDir}/${fileId}`;
    const fullFilePath = path.join(config.uploadDir, filepath);
    const uploadPathFile = fullFilePath + extension;
    
    // Создаем директории если их нет
    const uploadDir = path.dirname(uploadPathFile);
    try {
      await fs.mkdir(uploadDir, {recursive: true});

      // Извлекаем и санитизируем дополнительные метаданные из req.body
      // Исключаем служебные поля: fileId, key, bucketId (они сохраняются в File/Bucket)
      const customMetadata = extractCustomMetadata(req.body);
      log('custom metadata from request:', JSON.stringify(customMetadata));

      // В метаданные сохраняем только пользовательские поля
      // fileId, key, name, mimetype, createdAt - сохраняются в модели File
      const metadata = {
        ...customMetadata, // Только пользовательские метаданные
      };
      log('metadata to save:', JSON.stringify(metadata));

      await uploadedFile.mv(uploadPathFile);
      // Сохраняем метаданные в БД вместо JSON файла
      await saveMetadata(Meta, fileId, metadata);
      log('metadata saved to DB for fileId:', fileId);

      const resData = {
        fileId,
        url: `${config.baseUrl}/file/${fileId}`,
        status: RESULT.OK,
      };
      
      log('original filename:', uploadedFile.name, 'fixed filename:', filename, 'extension:', extension);
      
      await File.create({
        fileId: resData.fileId,
        filename: filename,
        mimetype: uploadedFile.mimetype,
        createdAt: moment().format('YYYY-MM-DD HH:mm:ss'),
        bucketId: bucketId,
        filepath: filepath, // {bucketId}/{YYYY-MM-DD}/{fileId}
        extension: extension,
      });
      
      // Создаем или обновляем Bucket
      await Bucket.findOneAndUpdate(
        { bucketId },
        { bucketId, createdAt: moment().format('YYYY-MM-DD HH:mm:ss') },
        { upsert: true, new: true }
      );

      await FileApiLog.create({
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        fileId: resData.fileId,
        endpoint: req.originalUrl,
        result: RESULT.OK,
        subresult: '',
      });

      log('<<< response', resData);
      res.json(resData);
      
      // Получаем созданную запись File для postUploadAction
      const fileRecord = await File.findOne({ fileId: resData.fileId });
      await postUploadAction(fileRecord);
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
