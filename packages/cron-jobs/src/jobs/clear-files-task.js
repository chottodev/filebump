const {File, CronTaskLog} = require('@filebump/models');
const {CronTask} = require('@filebump/utils').crontask;
const moment = require('moment');

class ClearFilesTask extends CronTask {
  static name = 'clear-files';
  static description = 'clear files';
  async runChild() {
    const deleted = await File.deleteMany({
      date: {
      // remove files older than 1 month
        $lt: moment().subtract(1, 'week').format('YYYY-MM-DD HH:mm:ss'),
      },
    });
    this.log(`deleted ${deleted.deletedCount} files`);
    return `deleted ${deleted.deletedCount} files`;
  }
}

const clearFilesTaskRun = async () => {
  const task = new ClearFilesTask({
    logModel: CronTaskLog,
    name: 'clear-files',
  });
  await task.run();
};

module.exports = {
  clearFilesTaskRun,
  ClearFilesTask,
};
