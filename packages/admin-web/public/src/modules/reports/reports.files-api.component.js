import template from './reports.files-api.template.pug';
const reportsFilesApi = {
  template: template(), // "/partials/reports/files-api",
  controller: [
    'Reports',
    function(Reports) {
      this.date = new Date();
      this.dateOptions = {
        dateDisabled: false,
        formatYear: 'yy',
        maxDate: new Date(),
        minDate: moment().subtract(1, 'years').toDate(),
        startingDay: 1,
      };
      this.refreshReport = function() {
        this.report = Reports.getFilesApi({
          date: moment(this.date).format('YYYY-MM-DD'),
        });
      };
      this.refreshReport();
    },
  ],
};
export {reportsFilesApi};

