//https://gist.github.com/BobNisco/9885852

(function () {
    'use strict';

    angular.module('climateControl')
    .directive('longPress', function ($timeout) {
        return {
            restrict: 'A',
            scope: {
                delay: '@',
                onLongPressStart: '&',
                onLongPressEnd: '&',
                onClick: '&'
            },
            link: function (scope, element, attrs) {

                var _promise;
                var _longPress = false;

                var onLongPress = function () {
                    _promise = $timeout(function () {
                        // apply the function given in on the element's on-long-press attribute
                        _longPress = true;
                        scope.$eval(scope.onLongPressStart);
                        _promise = $timeout(onLongPress, scope.delay);
                    }, scope.delay);

                }

                element.bind('mousedown', function (evt) {

                    element.bind('mouseup', stopLongPress);
                    element.bind('mouseleave', stopLongPress);
                    onLongPress();
                    
                });

                var stopLongPress = function () {
                    if (_longPress == false) {
                        if (scope.onClick) {
                            // If there is an on-click function attached to this element, apply it
                            scope.$apply(function () {
                                scope.$eval(scope.onClick)
                            });
                        }
                        else return;
                    }

                    // Prevent the onLongPress event from firing
                    $timeout.cancel(_promise);
                    element.unbind('mouseup', stopLongPress);
                    element.unbind('mouseleave', stopLongPress);
                    _longPress = false;

                    // If there is an on-long-press-end function attached to this element, apply it
                    if (scope.onLongPressEnd) {
                        scope.$apply(function () {
                            scope.$eval(scope.onLongPressEnd)
                        });
                    }
                }
                
                element.on('$destroy', function () {
                    $timeout.cancel(_promise);
                    element.bind('mousedown');
                    element.unbind('mouseup');
                    element.unbind('mouseleave');
                });
            }
        };
    })
})();