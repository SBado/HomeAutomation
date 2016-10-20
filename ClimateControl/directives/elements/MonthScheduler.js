(function () {
    'use strict';

    angular.module('climateControl')
        .directive('monthScheduler', monthSchedulerDirective)
        .controller('MonthSchedulerController', MonthSchedulerController)
        .controller('MS_ModalInstanceController', MS_ModalInstanceController);

    function monthSchedulerDirective() {
        return {
            restrict: 'E',
            templateUrl: 'directives/elements/templates/MonthScheduler.html',
            controller: MonthSchedulerController,
            controllerAs: 'vm',
            scope: {}         
        };
    }

    MonthSchedulerController.$inject = ['$scope', '$uibModal', '$confirm', 'TimeService', 'ClipboardService', 'ModelService', 'scheduledDays'];
    MS_ModalInstanceController.$inject = ['$scope', '$uibModalInstance', 'TimeService', 'date', 'values'];

    function MonthSchedulerController($scope, $uibModal, $confirm, TimeService, ClipboardService, ModelService, scheduledDays) {

        var vm = this;        

        var _clipboard = ClipboardService.clipboard;
        var _clipboardType = ClipboardService.type;
        var _hours = TimeService.hours;
        var _days = TimeService.days;
        var _months = TimeService.months;
        var _today = TimeService.currentDay;
        var _timespan = null;        
        var _scheduledDays = scheduledDays.data;
        var _firstTime = true;
        var _openPopup = true;
        var _watcher = $scope.$watch('vm.dt', onSelectedDateChanged);

        function init() {
            vm.dt = new Date();
            vm.today = today;
            vm.options = {
                customClass: getDayClass,
                minDate: new Date(),
                showWeeks: true
            };
            vm.dayContextMenu = dayContextMenu;
            vm.monthContextMenu = monthContextMenu;

            $scope.$on("$destroy", clean);
        }
        function today() {
            _openPopup = false;
            vm.dt = new Date();
        }
        function getDayClass(data) {
            var date = data.date, mode = data.mode;
            if (mode === 'day') {
                var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

                for (var i = 0; i < _scheduledDays.length; i++) {
                    var currentDay = new Date(_scheduledDays[i]).setHours(0, 0, 0, 0);

                    if (dayToCheck === currentDay && dayToCheck === _today)
                        return 'today scheduled';
                    else if (dayToCheck === currentDay)
                        return 'scheduled';
                }

                if (dayToCheck === _today)
                    return 'today';
            }

            return '';
        }
        function dayContextMenu(date) {
            var UTCDate = new Date(date);
            UTCDate.setHours(0, -date.getTimezoneOffset(), 0, 0);
            return [
                ['Copy', function () {
                    getSchedule(date, function (result) {
                        _clipboard.set(_clipboardType.DAY, result.data)
                    });
                }, function () {
                    return _scheduledDays.indexOf(UTCDate.toISOString()) != -1;
                }],                
                ['Paste', function () {
                    _timespan = TimeService.getJSONTimeSpan(date, TimeService.timeSpanType.DAY);
                    saveSchedule(_clipboard.get().values);
                }, function () {
                    return _clipboard.get().values.length == 24 && _clipboard.get().type === _clipboardType.DAY;
                }],                
                ['Delete Day', function () {
                    $confirm({ title: 'Warning', text: 'Are you sure you want to delete?', type: 'warning' }, { animation: true, size: 'sm' }).then(function () {
                        _timespan = TimeService.getJSONTimeSpan(date, TimeService.timeSpanType.DAY);
                        deleteSchedule();
                    })
                }, function () {
                    return _scheduledDays.indexOf(UTCDate.toISOString()) != -1;
                }],                
                ['Delete Month', function () {
                    $confirm({ title: 'Warning', text: 'Are you sure you want to delete?', type: 'danger' }, { animation: true, size: 'sm' }).then(function () {
                        deleteAllSchedules();
                    })
                }, function () {
                    return _scheduledDays.length > 0;
                }]
            ]
        }
        function monthContextMenu(month) {
            var date = new Date(month);
            return [
                ['Delete month', function () {
                    $confirm({ title: 'Warning', text: 'Are you really sure you want to delete?', type: 'danger' }, { animation: true, size: 'sm' }).then(function () {
                        //_timespan = TimeService.getJSONTimeSpan(date, TimeService.timeSpanType.MONTH);
                        deleteSchedule();
                    })
                }, function () {
                    _timespan = TimeService.getJSONTimeSpan(date, TimeService.timeSpanType.MONTH);
                    for (var index = 0; index < _scheduledDays.length; index++) {
                        if (_scheduledDays[index] > _timespan.dateBefore && _scheduledDays[index] && _scheduledDays[index] < _timespan.dateAfter)
                            return true;
                    }
                    return false;
                }],                
                ['Delete All Schedules', function () {
                    $confirm({ title: 'Warning', text: 'Are you really sure you want to delete?', type: 'danger' }, { animation: true, size: 'sm' }).then(function () {
                        deleteAllSchedules();
                    })
                }, function () {
                    return _scheduledDays.length > 0;
                }]
            ]
        }
        function getScheduledDays() {
            ModelService.scheduled_days().get({}, refreshCalendar, function (error) { console.log(error); });
        }
        function refreshCalendar(scheduledDays) {
            _scheduledDays = scheduledDays.data;
            $scope.$broadcast('refreshDatepickers');
        }
        function onSelectedDateChanged() {
            if (!_firstTime && _openPopup) {
                getSchedule(vm.dt, openModal, function (error) { console.log(error); });
            }
            else {
                _firstTime = false;
                _openPopup = true;
            }
        }
        function getSchedule(date, success, error) {
            _timespan = TimeService.getJSONTimeSpan(date, TimeService.timeSpanType.DAY);
            ModelService.scheduled_temps().get({ timespan: JSON.stringify(_timespan) }, null, success, error);
        }        
        function openModal(dataModel) {

            //var temperatures = {};
            var temperatures = [];
            var date = vm.dt;
            date.setHours(0, 0, 0, 0);
          
            for (var i = 0; i < 24; i++) {
                temperatures[i] = dataModel.data[i] || 2.0;
            }

            var day = _days[(date.getDay() - 1) > 0 ? (date.getDay() - 1) % 7 : 6];
            var dayNum = date.getDate();
            var month = _months[date.getMonth()];
            var year = date.getFullYear();

            var modalInstance = $uibModal.open({
                animation: true,
                template: '<div class="modal-header">\
                             <h3 class="modal-title">'
                             + day
                             + ', ' + dayNum
                             + ' ' + month
                             + ' ' + year + '</h3>\
                           </div>\
                           <div class="modal-body">\
                             <div class="table-responsive">\
                               <day-temperatures values="vm.values" custom-slider-style="vm.customSliderStyle()" save-on-close="true"></day-temperatures>\
                             </div>\
                           </div>\
                           <div class="modal-footer" style="border-top-width:0px;">\
                             <button type="button" class="btn btn-default btn-sm fade-background-color" ng-click="vm.onOk()">OK</button>\
                             <button type="button" class="btn btn-default btn-sm fade-background-color" ng-click="vm.onCancel()">Cancel</button>\
                           </div>',
                controller: 'MS_ModalInstanceController as vm',
                bindToController: true,
                size: 'lg',
                resolve: {
                    date: date,
                    values: function () {
                        return temperatures;
                    }
                }
            });

            modalInstance.result.then(saveSchedule);

        }
        function saveSchedule(temperatures) {
            ModelService.scheduled_temps().save({ timespan: JSON.stringify(_timespan), temperatures: JSON.stringify({ 'Temperatures': temperatures }) }, null, function (result) {
                getScheduledDays();
            }, function (error) { console.log(error) });

        }
        function deleteSchedule() {
            ModelService.scheduled_temps().delete({ timespan: JSON.stringify(_timespan) }, null, getScheduledDays);
        }
        function deleteAllSchedules() {
            ModelService.scheduled_temps().delete({}, null, getScheduledDays);
        }
        function clean() {
            _watcher();
        }        

        init();
    }

    function MS_ModalInstanceController($scope, $uibModalInstance, TimeService, date, values) {

        var vm = this;
        var _date = date;
        var _result = [];                          

        function init() {               
            vm.customSliderStyle = customSliderStyle;
            vm.onOk = submit;
            vm.onCancel = cancel;

            vm.values = [];
            vm.hours = TimeService.hours;
            for (var i = 0; i < 24; i++) {
                vm.values.push({ Temperature: values[i], Hour: vm.hours[i] });
            }
        }
        function buildResult() {
            for (var i = 0; i < 24; i++) {
                _result.push(vm.values[i].Temperature);
            }
        }
        function submit() {
            buildResult();
            $uibModalInstance.close(_result);
        };
        function cancel() {
            $uibModalInstance.dismiss('cancel');
        };
        function customSliderStyle() {
            return { 'background-color': '#FAFAFA' };
        }
                
        init();

    }

})();