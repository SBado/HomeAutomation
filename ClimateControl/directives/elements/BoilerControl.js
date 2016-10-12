(function () {
    'use strict';

    angular.module('climateControl')
           .directive('boilerControl', boilerControlDirective)
           .controller('BoilerControlController', BoilerControlController);

    function boilerControlDirective() {
        return {
            restrict: 'E',
            templateUrl: 'directives/elements/templates/BoilerControl.html',
            controller: BoilerControlController,
            controllerAs: 'vm',
            scope: {}
        };
    }

    function BoilerControlController($scope, $timeout, ConfigService, TemperatureService, ScheduleService, roomTemperature, manualBoilerTemperature, manualMode) {

        var vm = this;
        var _watches = [];        
        var _timeout = null;

        function init() {

            vm.minTemp = TemperatureService.minTemp;
            vm.maxTemp = TemperatureService.maxTemp;
            vm.roomTemperature = roomTemperature;
            vm.manualTemperature = { value: parseFloat(manualBoilerTemperature.data) };
            vm.scheduledTemperature = { value: ScheduleService.scheduledBoilerTemperature };
            vm.manualMode = manualMode.data;
            vm.boilerTemperature = vm.manualMode == 1 ? vm.manualTemperature : vm.scheduledTemperature;

            _watches.push($scope.$watch(getBoilerTemperature, resetTimeout, true));
            _watches.push($scope.$watch(getManualMode, saveManualMode));
            _watches.push($scope.$watch(getMinTemp, adjustManualTemperature, true));
            _watches.push($scope.$watch(getMaxTemp, adjustManualTemperature, true));

            $scope.$on("$destroy", clean);

            adjustManualTemperature();
        }
        function resetTimeout() {
            $timeout.cancel(_timeout);
            _timeout = $timeout(saveBoilerTemperature, 1500);
        }
        function getMinTemp() {
            return vm.minTemp;
        }
        function getMaxTemp() {
            return vm.maxTemp;
        }
        function getBoilerTemperature() {
            return vm.boilerTemperature;
        }
        function saveBoilerTemperature() {
            if (vm.manualMode == 1) {
                ConfigService.updateConfig('manualBoilerTemperature', vm.boilerTemperature.value);
            }
        }
        function getManualMode() {
            return vm.manualMode;
        }        
        function saveManualMode() {
            if (vm.manualMode == 1)
                vm.boilerTemperature = vm.manualTemperature;
            else {
                ScheduleService.upateSchedule();
                vm.boilerTemperature = { value: ScheduleService.scheduledBoilerTemperature };
            }
            ConfigService.updateConfig('manualMode', vm.manualMode);
        }
        function adjustManualTemperature() {
            if (vm.manualTemperature.value < vm.minTemp.value)
                vm.manualTemperature.value = vm.minTemp.value;
            else if (vm.manualTemperature.value > vm.maxTemp.value)
                vm.manualTemperature.value = vm.maxTemp.value;
        }
        function clean() {
            $timeout.cancel(_timeout);
            for (var i = 0; i < _watches.length; i++)
                _watches[i]();
        }

        init();
        
    }

    BoilerControlController.$inject = ['$scope', '$timeout', 'ConfigService', 'TemperatureService', 'ScheduleService', 'roomTemperature', 'manualBoilerTemperature', 'manualMode'];

})();