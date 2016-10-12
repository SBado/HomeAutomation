(function () {
    'use strict';

    angular.module('climateControl')
           .directive('daySelector', daySelectorDirective)
           .controller('DaySelectorController', DaySelectorController);

    function daySelectorDirective() {
        return {
            restrict: 'E',
            templateUrl: 'directives/elements/templates/DaySelector.html',
            controller: DaySelectorController,
            controllerAs: 'vm',
            scope: {},
        };
    }

    DaySelectorController.$inject = ['$scope', '$state', '$stateParams', 'TimeService'];

    function DaySelectorController($scope, $state, $stateParams, TimeService) {

        var vm = this;

        function init() {
            vm.days = TimeService.days;
            vm.today = TimeService.currentDay;
            vm.selectedDay = $stateParams.day || today;

            vm.changeDay = changeDay;
            vm.daySelectorStyle = daySelectorStyle;
        }                
        function changeDay (day) {
            vm.selectedDay = day;
            $state.go('home.dayscheduler.daytemperatures', { day: vm.selectedDay });
        }
        function daySelectorStyle(day) {
            var opacity = vm.selectedDay === day ? '1' : '0';
            return { 'opacity': opacity };
        }

        init();
    }
})();