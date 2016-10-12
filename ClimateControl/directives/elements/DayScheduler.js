(function () {
    'use strict';

    angular.module('climateControl')
           .directive('daySchedulerDirective', daySchedulerDirective)
           .controller('DaySchedulerController', DaySchedulerController);

    DaySchedulerController.$inject = ['$stateParams', 'TimeService'];

    function daySchedulerDirective() {
        return {
            restrict: 'E',
            templateUrl: 'directives/elements/templates/DayScheduler.html',
            controller: DaySchedulerController,
            controllerAs: 'vm',
            scope: true           
        };
    }

    function DaySchedulerController($stateParams, TimeService) {

        var vm = this;
        var today = null;

        function init() {
            //today = TimeService.currentDay;
            //vm.selectedDay = $stateParams.day || today;
        }

        init();
    }
})();