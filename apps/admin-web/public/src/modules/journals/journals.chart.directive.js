const chart = function() {
  return {
    restrict: 'A',
    scope: {
      params: '<',
    },
    link: function(scope, element) {
      this.chart = new Chart(element.get(0), scope.params);
    },
  };
};
export {chart};
