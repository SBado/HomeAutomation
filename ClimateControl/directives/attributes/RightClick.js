//http://stackoverflow.com/questions/15731634/how-do-i-handle-right-click-events-in-angular-js
//https://gist.github.com/Narven/a5a9e56c45c28ab05c7b

(function () {
    'use strict';

    angular.module('climateControl')
    .directive('rightClick', function ($parse) {
        return function (scope, element, attrs) {
            var fn = $parse(attrs.ngRightClick);
            element.bind('contextmenu', function (event) {
                scope.$apply(function () {
                    event.preventDefault();
                    fn(scope, { $event: event });
                });
            });
        };
    })
})();