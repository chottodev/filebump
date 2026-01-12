const express = require('express');
const moment = require('moment');
const {FileApiLog, File, CronTaskLog, Meta, Bucket} = require('@filebump/models');
const journalsRouter = express.Router();

function findColumnFilter(columns, columnName) {
  if (!columns || !Array.isArray(columns)) {
    return undefined;
  }
  const column = columns.find((column) => column.data === columnName);
  if (column && column.search) {
    return column.search.value;
  }
  return undefined;
}

journalsRouter.get('/files', async (req, res) => {
  const query = {};
  console.log('get /api/journals/files');

  const fileIdFilter = findColumnFilter(req.query.columns, 'fileId');
  if (fileIdFilter) {
    query.fileId = fileIdFilter;
  }
  const mimetypeFilter = findColumnFilter(req.query.columns, 'mimetype');
  if (mimetypeFilter) {
    query.mimetype = mimetypeFilter;
  }
  try {
    const rows = await File.find(query, null, {
      sort: '-createdAt',
      limit: parseInt(req.query.length || 10),
      skip: parseInt(req.query.start || 0),
    });
    const count = await File.countDocuments(query);
    res.json({
      draw: parseInt(req.query.draw),
      recordsTotal: count,
      recordsFiltered: count,
      data: rows,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({error: err.message});
  }
});

journalsRouter.get('/api', async (req, res) => {
  const query = {};
  const columns = req.query.columns;
  console.log('get /api/journals/api');

  const dateFilter = findColumnFilter(columns, 'date');
  if (dateFilter) {
    const [start, end] = dateFilter.split(' - ');

    query.date = {
      $gte: `${start} 00:00:00`,
      $lte: `${end} 23:59:59`,
    };
  } else {
    query.date = {
      $gte: moment().format('YYYY-MM-DD 00:00:00'),
      $lte: moment().format('YYYY-MM-DD 23:59:59'),
    };
  }

  const fileIdFilter = findColumnFilter(columns, 'fileId');
  if (fileIdFilter) {
    query.fileId = fileIdFilter;
  }
  const endpointFilter = findColumnFilter(columns, 'endpoint');
  if (endpointFilter) {
    query.endpoint = endpointFilter;
  }
  const resultFilter = findColumnFilter(columns, 'result');
  if (resultFilter === 'OK') {
    query.result = 'OK';
  } else if (resultFilter === 'FAIL') {
    query.result = 'FAIL';
  }

  try {
    const rows = await FileApiLog.find(query, null, {
      sort: '-date',
      limit: parseInt(req.query.length || 10),
      skip: parseInt(req.query.start || 0),
    });
    const count = await FileApiLog.countDocuments(query);
    res.json({
      draw: parseInt(req.query.draw),
      recordsTotal: count,
      recordsFiltered: count,
      data: rows,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({error: err.message});
  }
});

journalsRouter.get('/cron-task-log', async (req, res) => {
  const query = {};
  const columns = req.query.columns;
  console.log('get /api/journals/cron-task-log');

  const dateFilter = findColumnFilter(columns, 'date');
  if (dateFilter) {
    const [start, end] = dateFilter.split(' - ');

    query.date = {
      $gte: `${start} 00:00:00`,
      $lte: `${end} 23:59:59`,
    };
  } else {
    query.date = {
      $gte: moment().format('YYYY-MM-DD 00:00:00'),
      $lte: moment().format('YYYY-MM-DD 23:59:59'),
    };
  }

  const taskFilter = findColumnFilter(columns, 'task');
  if (taskFilter) {
    query.task = taskFilter;
  }
  const resultFilter = findColumnFilter(columns, 'result');
  if (resultFilter === 'OK') {
    query.result = 'OK';
  } else if (resultFilter === 'FAIL') {
    query.result = 'FAIL';
  }

  try {
    const rows = await CronTaskLog.find(query, null, {
      sort: '-date',
      limit: parseInt(req.query.length || 10),
      skip: parseInt(req.query.start || 0),
    });
    const count = await CronTaskLog.countDocuments(query);
    res.json({
      draw: parseInt(req.query.draw),
      recordsTotal: count,
      recordsFiltered: count,
      data: rows,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({error: err.message});
  }
});

journalsRouter.get('/files/:fileId/fileinfo', async (req, res) => {
  const {fileId} = req.params;
  console.log('get /api/journals/files/:fileId/fileinfo', fileId);
  
  try {
    // Получаем данные файла из модели File
    const file = await File.findOne({fileId});
    
    if (!file) {
      return res.status(404).json({error: 'File not found'});
    }
    
    // Получаем все метаданные для fileId из модели Meta
    const metaRecords = await Meta.find({fileId});
    
    // Преобразуем массив записей в объект
    const meta = {};
    metaRecords.forEach((record) => {
      meta[record.key] = record.value;
    });
    
    res.json({
      status: 'OK',
      fileId: file.fileId,
      filename: file.filename,
      mimetype: file.mimetype,
      createdAt: file.createdAt,
      bucketId: file.bucketId,
      meta,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({error: err.message});
  }
});

journalsRouter.get('/buckets', async (req, res) => {
  console.log('get /api/journals/buckets');
  
  try {
    const rows = await Bucket.find({}, null, {
      sort: '-createdAt',
      limit: parseInt(req.query.length || 10),
      skip: parseInt(req.query.start || 0),
    });
    const count = await Bucket.countDocuments({});
    
    res.json({
      draw: parseInt(req.query.draw || 1),
      recordsTotal: count,
      recordsFiltered: count,
      data: rows,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({error: err.message});
  }
});

journalsRouter.get('/meta', async (req, res) => {
  const query = {};
  console.log('get /api/journals/meta');
  
  // Фильтры для частичного совпадения
  if (req.query.fileId) {
    query.fileId = {$regex: req.query.fileId, $options: 'i'};
  }
  if (req.query.key) {
    query.key = {$regex: req.query.key, $options: 'i'};
  }
  if (req.query.value) {
    query.value = {$regex: req.query.value, $options: 'i'};
  }
  
  try {
    const rows = await Meta.find(query, null, {
      sort: '-_id',
      limit: parseInt(req.query.length || 50),
      skip: parseInt(req.query.start || 0),
    });
    const count = await Meta.countDocuments(query);
    
    res.json({
      draw: parseInt(req.query.draw),
      recordsTotal: count,
      recordsFiltered: count,
      data: rows,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({error: err.message});
  }
});

module.exports = journalsRouter;
