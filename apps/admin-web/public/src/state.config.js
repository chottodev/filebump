stateConfig.$inject = ['$stateProvider', '$urlRouterProvider'];
export default function stateConfig($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/journals');
  $stateProvider
      .state({
        name: 'journals',
        url: '/journals',
        component: 'journals',
      })
      .state({
        name: 'reports',
        url: '/reports',
        component: 'reports',
      })
      .state({
        name: 'reports.files-api',
        url: '/files-api',
        component: 'reportsFilesApi',
      })
      // PLOP INJECT STATE
      .state({
        name: 'links',
        url: '/links',
        component: 'links',
      })
  ;
}
