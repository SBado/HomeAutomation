(function () {
    'use strict';

    angular.module('climateControl')
    .directive('slider', function () {
        return {
            restrict: 'E',
            templateUrl: 'directives/elements/templates/Slider.html',
            scope: {
                min: '@',
                max: '@',
                selectedValue: '=',
                step: '@',
                uom: '@',
                sliderId: '@',
                sliderHeight: '@'
            },
            link: function (scope, element, attrs) {

                var _slider = element.find('#slider');
                var _longPressIteration = 0;
                var _toBeUpdated = true;
                var _watch = scope.$watch('selectedValue', selectedValueChanged);
                var _eventHandler = null;         

                function init() {
                    scope.min = parseFloat(attrs.min);
                    scope.max = parseFloat(attrs.max);
                    scope.step = parseFloat(attrs.step);
                    scope.sliderId = attrs.id;
                    scope.sliderHeight = attrs.height;
                    scope.longPressDelay = 400;

                    scope.increaseValue = increaseValue;
                    scope.decreaseValue = decreaseValue;
                    scope.increaseValueLongPress = increaseValueLongPress;
                    scope.decreaseValueLongPress = decreaseValueLongPress;
                    scope.onLongPressEnd = onLongPressEnd;
                    scope.$on("$destroy", clean);

                    _slider.slider({
                        orientation: 'vertical',
                        animate: 'slow',
                        value: scope.selectedValue,
                        min: scope.min,
                        max: scope.max,
                        step: scope.step,
                        range: "min",
                        slide: function (event, ui) {
                            scope.$apply(function () {
                                _toBeUpdated = false;
                                scope.selectedValue = ui.value;
                            });
                            //scope.$emit('valueUpdated', { 'id': attrs.id, 'value': ui.value });
                        }
                    });
                }
                function selectedValueChanged(newValue, oldValue) {
                    if (oldValue != newValue) {
                        if (_toBeUpdated)
                            _slider.slider('value', scope.selectedValue);
                        else
                            _toBeUpdated = true;
                        scope.$emit('valueUpdated', { 'id': attrs.id, 'value': newValue });
                    }
                }
                function updateSliderValue(newValue) {
                    //scope.selectedValue = newValue;
                    scope.selectedValue = parseFloat(parseFloat(newValue).toFixed(1));
                }
                function updateLongPress() {
                    _longPressIteration++;
                    disableSliderAnimation();
                    reduceDelay();
                }
                function enableSliderAnimation() {
                    _slider.slider('option', 'animate', true);
                }
                function disableSliderAnimation() {
                    _slider.slider('option', 'animate', false);
                }
                function reduceDelay() {
                    if (_longPressIteration <= 21 && _longPressIteration % 3 == 0) {
                        scope.longPressDelay = scope.longPressDelay / 2;
                    }
                }
                function resetDelay() {
                    scope.longPressDelay = 400;
                }
                function increaseValue() {
                    var newValue = parseFloat(scope.selectedValue) + parseFloat(scope.step);
                    if (newValue > scope.max)
                        newValue = scope.max;
                    updateSliderValue(newValue);

                    //scope.$emit('valueUpdated', { 'id': attrs.id, 'value': newValue });
                }
                function decreaseValue() {
                    var newValue = parseFloat(scope.selectedValue) - scope.step;
                    if (newValue < scope.min)
                        newValue = scope.min;
                    updateSliderValue(newValue);

                    //scope.$emit('valueUpdated', { 'id': attrs.id, 'value': newValue });
                }
                function increaseValueLongPress() {
                    updateLongPress();
                    scope.increaseValue();
                }
                function decreaseValueLongPress() {
                    updateLongPress();
                    scope.decreaseValue();
                }
                function onLongPressEnd() {
                    _longPressIteration = 0;
                    enableSliderAnimation();
                    resetDelay();
                }
                function clean() {
                    _watch();
                }

                init();
            }
        };
    });
})();