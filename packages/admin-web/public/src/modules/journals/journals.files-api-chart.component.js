import template from './tabs/_chart.template.pug';

const filesApiChart = {
  template: template(),
  bindings: {
    report: '<',
  },
  controller: [
    function() {
      this.$onInit = function() {
        this.chartParams = {
          type: 'bar',
          data: {
            datasets: [
              {
                label: 'OK',
                data: this.report.data.ok,
                backgroundColor: this.report.data.ok.map(function() {
                  return '#00ff00';
                }),
              },
              {
                label: 'FAIL',
                data: this.report.data.fail,
                backgroundColor: this.report.data.fail.map(function() {
                  return '#ff0000';
                }),
              },
            ],
            labels: this.report.data.labels,
          },
          options: {
            responsive: true,
            legend: {
              display: false,
              position: 'left',
            },
            scales: {
              x: {
                stacked: false,
                beginAtZero: true,
              },
              y: {
                stacked: false,
                min: 0,
              },
            },
          },
        };
      };
    },
  ],
};

export {filesApiChart};

