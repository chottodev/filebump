const filesTable = [
  '$compile',
  'dataTableLanguage',
  function($compile, dataTableLanguage) {
    return {
      restrict: 'A',
      scope: {
        onDraw: '&',
        filter: '<',
      },
      link: function(scope, element) {
        const dt = element.DataTable({
          // eslint-disable-line new-cap
          ordering: false,
          bPaginate: true,
          sDom: 'lrtip',
          bLengthChange: false,
          processing: true,
          serverSide: true,
          language: dataTableLanguage,
          ajax: '/journals/files/',
          columns: [
            {
              data: 'date',
            },
            {
              data: 'fileId',
            },
            {
              data: 'name',
            },
            {
              data: 'size',
            },
            {
              data: 'mimetype',
            },
            // {
            //   data: 'encoding',
            // },
            // {
            //   data: 'md5',
            // },
          ],
          order: [[0, 'desc']],
          createdRow: function(row, data) {
            const localScope = scope.$new(true);
            localScope.data = data;
            $compile(angular.element(row).contents())(localScope);
          },
        });
        dt.columns().every(function() {
          const that = this;
          $('input', this.header()).on('change', function() {
            if (that.search() !== $(this).val()) {
              that.search($(this).val(), false, false).draw();
            }
          });
          $('select', this.header()).on('change', function() {
            if (that.search() !== $(this).val()) {
              that.search($(this).val()).draw();
            }
          });
        });
        dt.on('draw', function() {
          scope.onDraw({params: dt.ajax.params()});
        });
      },
    };
  },
];
export {filesTable};

