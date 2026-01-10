// PLOP INJECT IMPORT COMPONENTS/DIRECTIVES
import {reports} from './reports.component';
import {reportsFilesApi} from './reports.files-api.component.js';
export const reportsmodule = angular.module('reports', [])
    // PLOP INJECT .<directive('name', name)>
    // PLOP INJECT .<component('name', name)>
    .component('reports', reports)
    .component('reportsFilesApi', reportsFilesApi);

