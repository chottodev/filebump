const cron = require('node-cron');
const config = require('./config');
const {clearFilesTaskRun} = require('./jobs/clear-files-task');

cron.schedule(config.clearFilesTask.schedule, ()=>{
  clearFilesTaskRun().catch(console.log);
});

console.log('start cron');
