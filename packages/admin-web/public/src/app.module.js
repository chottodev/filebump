// PLOP INJECT IMPORT MODULES
import {factoriesModule} from './factories/factories.module';
import {journalsModule} from './modules/journals/_module';
import {linksmodule} from './modules/links/_module';
import {reportsmodule} from './modules/reports/_module';
import stateConfig from './state.config';
angular
    .module('filebump_web', [
      'ngResource',
      'ui.bootstrap',
      'ui.router',
      'frapontillo.bootstrap-switch',
      'localytics.directives',
      journalsModule.name,
      factoriesModule.name,
      reportsmodule.name,
      linksmodule.name,
      // PLOP INJECT <module.name>
    ])
    .config(stateConfig)
    .constant('dataTableLanguage', {
      info: 'Показывается от _START_ до _END_ из _TOTAL_ записей',
      decimal: '',
      emptyTable: 'Нет данных по таблице',
      infoEmpty: 'Показывается от 0 до 0 из 0 записей',
      infoFiltered: '(Фильтрованно  из _MAX_ записей)',
      infoPostFix: '',
      thousands: ',',
      lengthMenu: 'Показывать _MENU_ записей',
      loadingRecords: 'Загрузка...',
      processing: 'Загрузка...',
      search: 'Поиск:',
      zeroRecords: 'Не найдено записей',
      paginate: {
        first: 'Начало',
        last: 'Конец',
        next: 'Следующая',
        previous: 'Предыдущая',
      },
      aria: {
        sortAscending: ': activate to sort column ascending',
        sortDescending: ': activate to sort column descending',
      },
    })

    .directive('dateTimeRangePicker', function() {
      return {
        restrict: 'A',
        link: function(scope, element) {
          const format = 'YYYY-MM-DD';
          element.daterangepicker({
            locale: {
              format: 'YYYY-MM-DD',
              separator: ' - ',
              applyLabel: 'Применить',
              cancelLabel: 'Отмена',
              fromLabel: 'От',
              toLabel: 'До',
              customRangeLabel: 'Выбрать',
              weekLabel: 'W',
              daysOfWeek: ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'],
              monthNames: [
                'Январь',
                'Февраль',
                'Март',
                'Апрель',
                'Май',
                'Июнь',
                'Июль',
                'Август',
                'Сентябрь',
                'Октябрь',
                'Ноябрь',
                'Декабрь',
              ],
              firstDay: 1,
            },
            alwaysShowCalendars: true,
            startDate: moment(moment().format('YY-MM-DD 00:00:00'), format),
            endDate: moment(moment().format('YY-MM-DD 23:59:59'), format),
            maxDate: moment(moment().format('YY-MM-DD 23:59:59'), format),
            timePicker: false,
            timePicker24Hour: false,
            ranges: {
              'Сегодня': [
                moment(moment().format('YY-MM-DD 00:00:00'), format),
                moment(moment().format('YY-MM-DD 23:59:59'), format),
              ],
              'Вчера': [
                moment(moment().format('YY-MM-DD 00:00:00'), format).subtract(
                    1,
                    'days',
                ),
                moment(moment().format('YY-MM-DD 23:59:59'), format).subtract(
                    1,
                    'days',
                ),
              ],
              'Последние 7 дней': [
                moment(moment().format('YY-MM-DD 00:00:00'), format).subtract(
                    6,
                    'days',
                ),
                moment(moment().format('YY-MM-DD 23:59:59'), format),
              ],
              'Последние 30 дней': [
                moment(moment().format('YY-MM-DD 00:00:00'), format).subtract(
                    29,
                    'days',
                ),
                moment(moment().format('YY-MM-DD 23:59:59'), format),
              ],
            },
          });
        },
      };
    });
