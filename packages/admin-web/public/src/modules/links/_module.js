// PLOP INJECT IMPORT COMPONENTS/DIRECTIVES
import {links} from './links.component';
export const linksmodule = angular.module('links', [])
    // PLOP INJECT .<directive('name', name)>
    // PLOP INJECT .<component('name', name)>
    .component('links', links);
