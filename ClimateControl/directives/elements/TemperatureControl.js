(function () {
    'use strict';

    angular.module('climateControl')
        .directive('temperatureControl', temperatureControlDirective);

    function temperatureControlDirective() {
        return {
            restrict: 'E',
            templateUrl: 'directives/elements/templates/TemperatureControl.html',
            controller: temperatureControlController,
            controllerAs: 'vm',
            scope: {
                background: '@',
                delay: '@'
            },
            bindToController: {
                manualMode: '=',
                boilerTemperature: '=',
                roomTemperature: '=',
                minTemp: '=',
                maxTemp: '='
            },
            link: function (scope, el, attrs, ctrl) {

                var _longPressIteration = 0;
                var colors = {
                    RED: '#E57373',
                    GREEN: 'rgb(15,157,88)',
                    YELLOW: 'rgb(244,180,0)',
                    BLUE: '#C5CAE9',
                    BLACK: 'rgb(0,0,0)',
                    DEFAULT: '#FAFAFA'
                };
                var buttons = {
                    INCREASE: 'increase-temp-button',
                    DECREASE: 'decrease-temp-button',
                    AUTO: 'auto-button',
                    MANUAL: 'manual-button'
                };
                var reduceDelay = function () {
                    if (_longPressIteration <= 12 && _longPressIteration % 3 == 0) {
                        scope.delay = scope.delay / 2;
                    }
                }
                var resetDelay = function () {
                    scope.delay = 400;
                }

                scope.onMouseDown = function (button) {
                    switch (button) {
                        case buttons.INCREASE:
                            scope.background = colors.RED;
                            break;
                        case buttons.DECREASE:
                            scope.background = colors.BLUE;
                            break;
                            //case buttons.AUTO:
                            //    scope.background = colors.GREEN;
                            //    break;
                            //case buttons.MANUAL:
                            //    scope.background = colors.YELLOW;
                            //    break;
                    }
                }
                scope.onMouseUp = function () {
                    scope.background = colors.DEFAULT;
                }
                scope.onMouseLeave = function (button) {
                    scope.background = colors.DEFAULT;
                }
                scope.onLongPressIncreaseTemp = function () {
                    _longPressIteration++;
                    reduceDelay();
                    ctrl.increaseTemperature();
                }
                scope.onLongPressLowerTemp = function () {
                    _longPressIteration++;
                    reduceDelay();
                    ctrl.lowerTemperature();
                }
                scope.onLongPressEnd = function () {
                    _longPressIteration = 0;
                    resetDelay();
                    //ctrl.updateBoilerStatus();
                }
                scope.background = colors.DEFAULT;

                resetDelay();                
            }
        };
    }

    function temperatureControlController($scope, $attrs, $timeout, ConfigService, ScheduleService, TemperatureService) {

        var vm = this;
        var _watch = null;
        var _eventHandler = null;

        function init() {
            vm.humidity = TemperatureService.humidity;
            vm.manualMode = parseInt(vm.manualMode);
            vm.isBurning = false;

            vm.increaseTemperature = increaseTemperature;
            vm.lowerTemperature = lowerTemperature;
            vm.setManualMode = setManualMode;

            _watch = $scope.$watch(getTemperatures, updateBoilerStatus, true);
            $scope.$on("$destroy", clean);
        }
        function getTemperatures() {
            return { 'boilerTemperature': vm.boilerTemperature.value, 'roomTemperature': vm.roomTemperature };
        }
        function setManualMode(mode) {
            vm.manualMode = mode;
            //SE AUTO DEVO LEGGERE LA TEMPERATURA DA IMPOSTARE!!!           
        }
        function increaseTemperature() {
            if (vm.boilerTemperature.value < vm.maxTemp.value) {
                vm.boilerTemperature.value = vm.boilerTemperature.value + 0.1;
                vm.boilerTemperature.value = parseFloat(vm.boilerTemperature.value.toFixed(1));
            }
        }
        function lowerTemperature () {
            if (vm.boilerTemperature.value > vm.minTemp.value) {
                vm.boilerTemperature.value = vm.boilerTemperature.value - 0.1;
                vm.boilerTemperature.value = parseFloat(vm.boilerTemperature.value.toFixed(1))
            }
        }
        function startBurning() {
            vm.isBurning = true;
            TemperatureService.startBurning();
        }
        function stopBurning() {
            vm.isBurning = false;
            TemperatureService.stopBurning();
        }
        function updateBoilerStatus() {
            if (vm.boilerTemperature.value > vm.roomTemperature && vm.isBurning == false)
                startBurning();

            if (vm.boilerTemperature.value <= vm.roomTemperature && vm.isBurning == true)
                stopBurning();
        }
        function clean() {
            _watch();
        }

        init();
    }

    temperatureControlController.$inject = ['$scope', '$attrs', '$timeout', 'ConfigService', 'ScheduleService', 'TemperatureService'];

})();