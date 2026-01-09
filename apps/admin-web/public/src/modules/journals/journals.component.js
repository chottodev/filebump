import template from './journals.index.template.pug';
const journals = {
  template: template(),
  controller: [
    'Charts',
    function(Charts) {
      this.report = Charts.getFilesApi();
    },
  ],
};
export {journals};

