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

const {getId} = require('../getId.js');

const authHeader = config.authHeader || 'X-API-Key';

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

const postUploadAction = async (metadata) => {
  if (metadata.mimetype !== 'audio/ogg' && metadata.mimetype !== 'audio/mpeg') {
    return console.log(
        `${metadata.mimetype}: post actions for uploaded mimetype is not defined`,
    );
  }

  if (metadata.mimetype === 'audio/ogg' || metadata.mimetype === 'audio/mpeg') {
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

module.exports = (FileApiLog, File, Meta) => {
  async function post(req, res) {
    console.log('post /download');
    const startTime = performance.now();
    requestCounter++;
    const log = (...args) => {
      console.log(`[download:${requestCounter}]`, ...args);
    };
    const downloadUrl = req.body.url;
    const fileId = getId();

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
      const filename = targetHeader ? targetHeader.match(filenameReg)?.[1] : null;
      const mimetype = (mimeType) ? mimeType : response.headers['content-type'];
      
      const metadata = {
        fileId,
        downloadUrl,
        mimetype,
        size: response.headers['content-length'],
        dateCreated: (+date / 1000).toFixed(0),
        key,
      };
      log({metadata});

      const subDirId = fileId.substring(0, 4);
      const subDirPath = path.join(config.uploadDir, subDirId);
      await fs.mkdir(subDirPath, {recursive: true});

      const uploadPathFile = path.join(subDirPath, fileId);

      await fs.writeFile(uploadPathFile, response.data, {encoding: 'binary'});
      // Сохраняем метаданные в БД вместо JSON файла
      await saveMetadata(Meta, fileId, metadata);
      
      // Сохраняем данные файла в модель File
      await File.create({
        fileId,
        filename: filename || null,
        mimetype: mimetype || null,
        dateCreated: moment().format('YYYY-MM-DD HH:mm:ss'),
      });

      await FileApiLog.create({
        date: moment().format('YYYY-MM-DD HH:mm:ss'),
        fileId: metadata.fileId,
        endpoint: req.originalUrl,
        result: RESULT.OK,
        subresult: '',
      });
      log('file download success', fileId);
      await postUploadAction(metadata);
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
    tags: ['files'],
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
