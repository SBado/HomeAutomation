(function () {
    'use strict';

    angular.module('climateControl')
        .directive('blurAfterClick', function () {
            return {
                restrict: 'A',
                link: function (scope, element, attrs) {

                    function blurElement(event) {
                        event.target.blur();
                        //element.blur();
                    }

                    element.bind('click', blurElement);                    
                    element.on('$destroy', function (e) {
                        element.unbind('click', blurElement);
                    });
                }
            };
        })
})();