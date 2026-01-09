
import {NotificationService} from './notification.service';

export const coreModule = angular.module('core', [])
    .service('NotificationService', NotificationService);
