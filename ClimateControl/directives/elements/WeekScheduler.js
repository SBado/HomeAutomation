(function () {
    'use strict';

    angular.module('climateControl')
        .directive('weekScheduler', weekSchedulerDirective)
        .controller('WeekSchedulerController', WeekSchedulerController)
        .controller('WS_ModalInstanceController', WS_ModalInstanceController);

    function weekSchedulerDirective() {
        return {
            restrict: 'E',
            templateUrl: 'directives/elements/templates/WeekScheduler.html',
            controller: WeekSchedulerController,
            controllerAs: 'vm',
            scope: {},           
        };
    }

    WeekSchedulerController.$inject = ['$rootScope', '$scope', '$uibModal', '$confirm', 'ClipboardService', 'SQLiteService', 'TimeService', 'temperatures'];
    WS_ModalInstanceController.$inject = ['$uibModalInstance', 'params'];

    function WeekSchedulerController($rootScope, $scope, $uibModal, $confirm, ClipboardService, SQLiteService, TimeService, temperatures) {

        var vm = this;

        var _clipboard = ClipboardService.clipboard;
        var _clipboardType = ClipboardService.type;
        var _data = temperatures.data;
        var _days = TimeService.days;
        var _eventHandlers = [];

        function init() {
            vm.records = [];
            for (var i = 0; i < _data.length; i += 24)
                vm.records.push({ 'day': _data[i].Day, values: [] });

            var j = 0;
            for (var i = 0; i < _data.length; i++) {
                vm.records[j].values.push({ 'hour': _data[i].Hour, 'temperature': _data[i].Temperature });
                if (i > 0 && i % 24 == 23)
                    j++;
            }

            //TODO: query per valore di isBurning
            vm.isBurning = true;
            vm.today = TimeService.currentDay;
            vm.currentHour = TimeService.currentHour + ':00';            
            vm.hours = TimeService.hours;            
            vm.emptyContextMenu = [];
            vm.hourContextMenu = [
                ['Copy', function ($itemScope) {
                    _clipboard.set(_clipboardType.HOUR, $itemScope.value.temperature);
                }],
                null,
                ['Copy To Day', function ($itemScope, $event, model) {
                    _clipboard.set(_clipboardType.HOUR, $itemScope.value.temperature);
                    setSameTempForDay(model.day, $itemScope.value.temperature);
                }],
                null,
                ['Copy To All', function ($itemScope) {
                    _clipboard.set(_clipboardType.HOUR, $itemScope.value.temperature);
                    setSameTempForAll($itemScope.value.temperature);
                }],
                null,
                ['Paste', function ($itemScope, $event, model) {
                    //$itemScope.value.temperature = _clipboard.get().values[0];
                    setTempForHour(model.day, $itemScope.value.hour, _clipboard.get().values[0]);
                }, function ($itemScope) {
                    return _clipboard.get().values.length == 1 && _clipboard.get().type === _clipboardType.HOUR;
                }],
                null,
                ['Reset', function ($itemScope, $event, model) {
                    $confirm({ text: 'Are you sure you want to reset ' + model.day + ' at ' + $itemScope.value.hour + '?' }, { animation: true, size: 'sm' }).then(function () {
                        setTempForHour(model.day, $itemScope.value.hour, 2.0);
                    })
                }],
                null,
                ['Reset All', function ($itemScope) {
                    $confirm({ text: 'Are you sure you want to reset all days?' }, { animation: true, size: 'sm' }).then(function () {
                        setSameTempForAll(2.0);
                    })
                }]
            ];
            vm.dayContextMenu = [
                ['Copy Day', function ($itemScope) {
                    _clipboard.set(_clipboardType.DAY, getTemperatures($itemScope.record.day));
                }],
                null,
                ['Copy Day To All', function ($itemScope) {
                    _clipboard.set(_clipboardType.DAY, getTemperatures($itemScope.record.day));
                    setDifferentTempsForAll(_clipboard.get().values);
                }],
                null,
                ['Paste Day', function ($itemScope) {
                    setDifferentTempsForDay($itemScope.record.day, _clipboard.get().values);
                }, function () {
                    return _clipboard.get().values.length == 24 && _clipboard.get().type === _clipboardType.DAY;
                }],
                null,
                ['Reset Day', function ($itemScope) {
                    $confirm({ text: 'Are you sure you want to reset ' + $itemScope.record.day + '?' }, { animation: true, size: 'sm' }).then(function () {
                        setSameTempForDay($itemScope.record.day, 2.0);
                    })
                }],
                null,
                ['Reset All Days', function ($itemScope) {
                    $confirm({ text: 'Are you sure you want to reset all days?' }, { animation: true, size: 'sm' }).then(function () {
                        setSameTempForAll(2.0);
                    })
                }]
            ];

            vm.onClick = openModal;
            vm.currentHourStyle = currentHourStyle;

            _eventHandlers.push($rootScope.$on('timeChanged', checkSchedule));
            $scope.$on("$destroy", clean);
        }        
        function checkSchedule() {
            vm.today = TimeService.currentDay;
            vm.currentHour = TimeService.currentHour + ':00';
            //TODO: CONTROLLO SE LA CALDAIA È AVVIATA: isBurning = ...
        }
        function getTemperatures(day) {

            var temps = [];
            for (var i = 0; i < vm.records.length; i++) {
                if (vm.records[i].day === day) {
                    for (var j = 0; j < vm.records[i].values.length; j++) {
                        temps.push(vm.records[i].values[j].temperature);
                    }
                }
            }

            return temps;
        }
        function openModal(day, hour, temperature) {
            var modalInstance = $uibModal.open({
                animation: true,
                template: '<div class="modal-header" style="border-bottom-width: 0px;">\
                             <h3 class="modal-title" style="text-align: center;">' + day + ' ' + hour + '</h3>\
                           </div>\
                           <div class="modal-body">\
                             <div style="background-color: rgb(245,245,245); padding-top: 8px; padding-bottom: 8px; border-style: solid; border-width: 1px 0.5px 0.5px 0.5px; border-color: #ddd; border-radius: 6px;">\
                               <slider min="2" max="35" step="0.1" selected-value="vm.temperature" uom="°"></slider>\
                             </div>\
                           </div>\
                           <div class="modal-footer" style="border-top-width: 0px;">\
                             <button type="button" class="btn btn-default btn-sm fade-background-color" ng-click="vm.onOk()">OK</button>\
                             <button type="button" class="btn btn-default btn-sm fade-background-color" ng-click="vm.onCancel()">Cancel</button>\
                           </div>',
                controller: 'WS_ModalInstanceController as vm',
                bindToController: true,
                size: 'sm',
                resolve: {
                    params: {
                        'day': day,
                        'hour': hour,
                        'temperature': temperature
                    }
                }
            });

            modalInstance.result.then(saveSchedule, function () {
            });
        }
        function saveSchedule(schedule) {
            setTempForHour(schedule.day, schedule.hour, schedule.temperature);
        }
        function setTempForHour(day, hour, temperature) {

            SQLiteService.daily_temps().update({ day: day, hour: hour, temperature: temperature }, null, function (result) {
                //deleteCacheForHour(day, hour);
                syncModelForHour(day, hour, temperature);
            });
        }
        function setSameTempForDay(day, temperature) {

            var json = {};
            for (var i = 0; i < 24; i++)
                json[vm.hours[i]] = temperature;

            SQLiteService.daily_temps().update({ day: day, temperature: JSON.stringify(json) }, null, function (result) {
                //deleteCacheForDay(day);
                syncModelSameTempForday(day, temperature);
            });
        }
        function setDifferentTempsForDay(day, temperatures) {

            var json = {};
            for (var i = 0; i < 24; i++)
                json[vm.hours[i]] = temperatures[i];

            SQLiteService.daily_temps().update({ day: day, temperature: JSON.stringify(json) }, null, function (result) {
                //deleteCacheForDay(day);
                syncModelDifferentTempsForday(day, temperatures);
            });
        }
        function setSameTempForAll(temperature) {

            var json = {};
            for (var i = 0; i < 24; i++)
                json[vm.hours[i]] = temperature;

            SQLiteService.daily_temps().update({ temperature: JSON.stringify(json) }, null, function (result) {
                //deleteCache();
                syncModelSameTemp(temperature);
            });
        }
        function setDifferentTempsForAll(temperatures) {

            var json = {};
            for (var i = 0; i < 24; i++)
                json[vm.hours[i]] = temperatures[i];

            SQLiteService.daily_temps().update({ temperature: JSON.stringify(json) }, null, function (result) {
                //deleteCache();
                syncModelDifferentTemps(temperatures);
            });
        }
        function syncModelForHour(day, hour, temperature) {
            for (var i = 0; i < vm.records.length; i++) {
                if (vm.records[i].day === day) {
                    for (var j = 0; j < vm.records[i].values.length; j++) {
                        if (vm.records[i].values[j].hour === hour) {
                            vm.records[i].values[j].temperature = temperature;
                            return;
                        }
                    }
                }
            }
        }
        function syncModelSameTempForday(day, temperature) {
            for (var i = 0; i < vm.records.length; i++) {
                if (vm.records[i].day === day) {
                    for (var j = 0; j < vm.records[i].values.length; j++) {
                        vm.records[i].values[j].temperature = temperature;
                    }
                }
            }
        }
        function syncModelDifferentTempsForday(day, temperatures) {
            for (var i = 0; i < vm.records.length; i++) {
                if (vm.records[i].day === day) {
                    for (var j = 0; j < vm.records[i].values.length; j++) {
                        vm.records[i].values[j].temperature = temperatures[j];
                    }
                }
            }
        }
        function syncModelSameTemp(temperature) {
            for (var i = 0; i < vm.records.length; i++) {
                for (var j = 0; j < vm.records[i].values.length; j++) {
                    vm.records[i].values[j].temperature = temperature;
                }
            }
        }
        function syncModelDifferentTemps(temperatures) {
            for (var i = 0; i < vm.records.length; i++) {
                for (var j = 0; j < vm.records[i].values.length; j++) {
                    vm.records[i].values[j].temperature = temperatures[j];
                }
            }
        }
        function currentHourStyle (day, hour) {
            var border = day == vm.today && hour == vm.currentHour ? (vm.isBurning ? '2px solid red' : '2px solid') : ''
            return { 'border': border };
        }
        function clean() {
            for (var i = 0; i < _eventHandlers.length; i++) {
                _eventHandlers[i]();
            }
        }

        init();
        
    }

    function WS_ModalInstanceController($uibModalInstance, params) {

        var vm = this;

        function init() {
            vm.day = params.day;
            vm.hour = params.hour;
            vm.temperature = params.temperature;

            vm.onOk = submit;
            vm.onCancel = cancel;
        }
        function submit() {
            $uibModalInstance.close({ 'day': vm.day, 'hour': vm.hour, 'temperature': vm.temperature });
        };
        function cancel() {
            $uibModalInstance.dismiss('cancel');
        };

        init();
    }



})();