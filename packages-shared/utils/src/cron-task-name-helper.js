// TODO: Update imports to use new package structure
// const {ReloadInstancesTask} = require('@filebump/cron-jobs/src/jobs/reload-instances');
// const {RemoveOldMessagesTask} = require('@filebump/cron-jobs/src/jobs/remove-old-messages');
// const {CheckInstanceStatusTask} = require('@filebump/cron-jobs/src/jobs/check-instance-status');
// const {UpdateOldVersionsTask} = require('@filebump/cron-jobs/src/jobs/update-old-versions');
// const {CheckCountAccounts} = require('@filebump/cron-jobs/src/jobs/check-count-accounts');

function getCronTasksNamesAndDescriptions() {
  // TODO: Implement when tasks are available
  // const tasks = [ReloadInstancesTask, RemoveOldMessagesTask,
  //   CheckInstanceStatusTask,
  //   UpdateOldVersionsTask,
  //   CheckCountAccounts];
  // const table = tasks.map((t) => {
  //   const obj = {name: t.name, description: t.description};
  //   return obj;
  // });
  // return table;
  return [];
}

module.exports = {
  getCronTasksNamesAndDescriptions,
};
