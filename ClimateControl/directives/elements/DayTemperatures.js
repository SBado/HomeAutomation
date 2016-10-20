(function () {
    'use strict';

    angular.module('climateControl')
           .directive('dayTemperatures', dayTemperaturesDirective)
           .controller('DayTemperaturesController', DayTemperaturesController);

    function dayTemperaturesDirective() {
        return {
            restrict: 'E',
            templateUrl: 'directives/elements/templates/DayTemperatures.html',
            controller: DayTemperaturesController,
            controllerAs: 'vm',
            scope: {
                values: '=',
                saveOnClose: '@',
                customSliderStyle: '&'
            }
        };
    }

    DayTemperaturesController.$inject = ['$rootScope', '$scope', '$stateParams', '$attrs', '$timeout', '$interval', '$confirm', 'ClipboardService', 'ModelService', 'TimeService'];

    function DayTemperaturesController($rootScope, $scope, $stateParams, $attrs, $timeout, $interval, $confirm, ClipboardService, ModelService, TimeService) {

        var vm = this;

        var _hours = TimeService.hours;
        var _clipboard = ClipboardService.clipboard;
        var _clipboardType = ClipboardService.type;
        var _promises = {};
        var _eventHandlers = [];

        function init() {            
            if ($scope.values)
                vm.values = $scope.values;
            else if ($scope.$parent.values)
                vm.values = $scope.$parent.values.data;

            vm.days = TimeService.days;
            vm.today = TimeService.currentDay;
            vm.selectedDay = $stateParams.day || vm.today;
            vm.currentHour = TimeService.currentHour + ':00';
            vm.isBurning = false;

            if (!$scope.saveOnClose) {
                _eventHandlers.push($rootScope.$on('timeChanged', checkSchedule));
                _eventHandlers.push($scope.$on('valueUpdated', updateValue));
                $scope.$on("$destroy", clean);
            }

            vm.contextMenu = [
                ['Copy', function ($itemScope) {
                    _clipboard.set(_clipboardType.HOUR, $itemScope.value.Temperature);
                }],                
                ['Copy To All', function ($itemScope) {
                    _clipboard.set(_clipboardType.HOUR, $itemScope.value.Temperature);
                    setTemperatureBulk($itemScope.value.Temperature);
                }],                
                ['Paste', function ($itemScope) {
                    $itemScope.value.Temperature = _clipboard.get().values[0];
                    //setTemperature($itemScope.value.Hour, _clipboard.get().values[0]);
                }, function ($itemScope) {
                    return _clipboard.get().values.length == 1 && _clipboard.get().type === _clipboardType.HOUR;
                }],
                ['Reset', function ($itemScope) {
                    $confirm({ text: 'Are you sure you want to reset ' + vm.selectedDay + ' at ' + $itemScope.value.Hour + '?' }, { animation: true, size: 'sm' }).then(function () {
                        $itemScope.value.Temperature = 2.0;
                        //setTemperature($itemScope.value.Hour, 2.0);
                    })
                }],                
                ['Reset Day', function ($itemScope) {
                    $confirm({ title: 'Warning', text: 'Are you sure you want to reset ' + vm.selectedDay + '?', type: 'warning' }, { animation: true, size: 'sm' }).then(function () {
                        setTemperatureBulk(2.0);
                    })
                }]
            ];
            vm.customSliderStyle = customSliderStyle;
        }        
        function syncLocalModel(temperatures) {
            for (var i = 0; i < 24; i++) {
                if (temperatures instanceof Array)
                    vm.values[i].Temperature = temperatures[i];
                else
                    vm.values[i].Temperature = temperatures;
            }
        }
        function updateValue(event, data) {
            $timeout.cancel(_promises[data.id]);
            _promises[data.id] = $timeout(function () {
                delete _promises[data.id];
                setTemperature(data.id, data.value);
            }, 500);
        }
        function setTemperature(hour, temperature) {            
            ModelService.daily_temps().update({ day: vm.selectedDay, hour: hour, temperature: temperature });
        }
        function setTemperatureBulk(temperature) {
            var json = {};
            for (var i = 0; i < 24; i++)
                json[_hours[i]] = temperature;

            ModelService.daily_temps().update({ day: vm.selectedDay, temperature: JSON.stringify(json) }, null, function () {
                syncLocalModel(temperature);
            });

        }       
        function checkSchedule() {
            vm.today = TimeService.currentDay;
            vm.currentHour = TimeService.currentHour + ':00';
            //TODO: CONTROLLO SE LA CALDAIA È AVVIATA: isBurning = ...
        }
        function customSliderStyle (value) {
            if ($attrs.customSliderStyle) {
                $scope.customSliderStyle(value);
                return;
            }
            var color = vm.currentHour == value.Hour && vm.selectedDay == vm.today ? (vm.isBurning ? 'rgb(229, 115, 115)' : 'rgb(230,230,230)') : '#FAFAFA';
            return { 'background-color': color };
        }
        function clean() {
            for (var i = 0; i < _eventHandlers.length; i++) {
                _eventHandlers[i]();
            }
        }

        init();


    }


})();