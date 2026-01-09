// PLOP INJECT IMPORT COMPONENTS/DIRECTIVES
import {filesApiChart} from './journals.files-api-chart.component';
import {journals} from './journals.component';
import {filesApiTable} from './journals.files-api-table.directive';
import {filesTable} from './journals.files-table.directive';
import {chart} from './journals.chart.directive';
export const journalsModule = angular.module('journals', [])
    // PLOP INJECT .<directive('name', name)>
    .directive( 'filesApiTable', filesApiTable )
    .directive('filesTable', filesTable)
    .directive('chart', chart)
    // PLOP INJECT .<component('name', name)>
    .component('filesApiChart', filesApiChart)
    .component('journals', journals);
