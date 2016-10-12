(function () {
    'use strict';

    angular.module('climateControl')
           .directive('temperatureGauge', temperatureGaugeDirective);

    function temperatureGaugeDirective($rootScope, $interval) {
        return {
            restrict: 'E',
            templateUrl: 'directives/elements/templates/TemperatureGauge.html',
            transclude: true,
            replace: true,
            controller: temperatureGaugeController,
            controllerAs: 'vm',
            scope: {
                calculateDegrees: '&'
            },
            bindToController: {
                manualMode: '@',
                boilerTemperature: '=',
                roomTemperature: '=',
                minTemp: '=',
                maxTemp: '='
                //trend: '@'
            },
            link: function (scope, element, attrs, ctrl) {
                
                var _minAngle = -45;
                var _maxAngle = 225;
                var _defaultColor = element.css('background-color');
                var _red = 'rgb(229, 115, 115)';
                var _promise;
                var _eventHandlers = [];

                function init() {
                    scope.calculateDegrees = calculateDegrees;
                    scope.calculateBoilerTemp = calculateBoilerTemp;
                    scope.parentClick = parentClick;
                    scope.childClick = childClick;

                    _eventHandlers.push($rootScope.$on('burningStarted', startColorChange));
                    _eventHandlers.push($rootScope.$on('burningStopped', stopColorCHange));
                    element.on('$destroy', clean);
                }
                function startColorChange() {
                    element.css('-o-transition', 'background 1000ms linear');
                    element.css('-moz-transition', 'background 1000ms linear');
                    element.css('-webkit-transition', 'background 1000ms linear');
                    element.css('transition', 'background 1000ms linear');
                    _promise = $interval(changeColor, 2000);
                }
                function changeColor() {
                    var color = element.css('background-color');

                    if (color == _red) {
                        element.css('background-color', _defaultColor);
                    }
                    else {
                        element.css('background-color', _red);
                    }
                }
                function stopColorCHange() {
                    $interval.cancel(_promise);
                    element.css('background-color', _defaultColor);
                }
                function calculateDegrees (temperature) {

                    if (temperature <= ctrl.minTemp.value)
                        return _minAngle;

                    if (temperature >= ctrl.maxTemp.value)
                        return _maxAngle;

                    return _minAngle + (temperature - ctrl.minTemp.value) * ((_maxAngle - _minAngle) / (ctrl.maxTemp.value - ctrl.minTemp.value));
                }
                function calculateBoilerTemp (x, y) {
                    var center = {
                        x: parseInt(element.css('width')) / 2,
                        y: parseInt(element.css('height')) / 2
                    }
                    var deltaX = x - center.x;
                    var deltaY = center.y - y;
                    var rad = Math.atan2(deltaY, deltaX); // In radians
                    if (rad > 0)
                        rad = -(rad - Math.PI);
                    else if (rad < (-Math.PI / 2))
                        rad = -(rad + Math.PI)
                    else
                        rad = -(rad - Math.PI)
                    var deg = rad * (180 / Math.PI);
                    if (deg < _minAngle)
                        deg = _minAngle;
                    if (deg > _maxAngle)
                        deg = _maxAngle;
                    ctrl.boilerTemperature.value = ctrl.minTemp.value + (deg - _minAngle) * ((ctrl.maxTemp.value - ctrl.minTemp.value) / (_maxAngle - _minAngle));
                    ctrl.boilerTemperature.value = parseFloat(ctrl.boilerTemperature.value.toFixed(1))
                }
                function parentClick(event) {
                    scope.calculateBoilerTemp(event.offsetX, event.offsetY);
                }
                function childClick (event) {
                    scope.calculateBoilerTemp(angular.element(event.target).prop('offsetLeft') + event.offsetX, angular.element(event.target).prop('offsetTop') + event.offsetY);
                }
                function clean() {
                    $interval.cancel(_promise);
                    for (var i = 0; i < _eventHandlers.length; i++) {
                        _eventHandlers[i]();
                    }
                }
                
                init();
            }
        };
    }

    function temperatureGaugeController(TemperatureService) {
        var vm = this;

        vm.trend = TemperatureService.trend;
    }

    temperatureGaugeController.$inject = ['TemperatureService']
    temperatureGaugeDirective.$inject = ['$rootScope', '$interval'];

})();