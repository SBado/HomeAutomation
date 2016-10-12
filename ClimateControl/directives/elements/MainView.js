(function () {
    'use strict';

    angular.module('climateControl')
           .directive('mainView', mainViewDirective)
           .controller('MainViewController', MainViewController)

    function mainViewDirective() {
        return {
            restrict: 'E',
            templateUrl: 'directives/elements/templates/MainView.html',
            scope: true,
            controllerAs: 'vm'
        };
    }

    function MainViewController($rootScope, $scope, $mdSidenav, $state, $uibModal, AuthenticationService, UserService, TimeService) {

        var vm = this;
        var _eventHandlers = [];

        function init() {
            if (!$scope.currentUser)
                $scope.currentUser = UserService.getCurrentUser();

            _eventHandlers.push($rootScope.$on('$stateChangeSuccess', function (e, curr, prev) {
                setPageTitle(curr.name);
            }));
            $scope.$on("$destroy", clean);

            vm.pageTitle = '';
            vm.openSideNavPanel = openSideNavPanel;
            vm.closeSideNavPanel = closeSideNavPanel;
            vm.goTo = goTo;
            vm.goToDayScheduler = goToDayScheduler;
            vm.showSettings = showSettings;
            vm.logOut = logOut;
        }
        function setPageTitle(state) {
            switch (state) {
                case 'home.manualcontrol':
                    vm.pageTitle = 'Manual Control';
                    break;
                case 'home.dayscheduler':
                case 'home.dayscheduler.daytemperatures':
                    vm.pageTitle = 'Day Scheduler';
                    break;
                case 'home.weekscheduler':
                    vm.pageTitle = 'Week Scheduler';
                    break;
                case 'home.monthscheduler':
                    vm.pageTitle = 'Month Scheduler';
                    break;
                default:
                    vm.pageTitle = 'Climate Control';
            }
        }
        function openSideNavPanel() {
            $mdSidenav('left').open();
        };
        function closeSideNavPanel() {
            $mdSidenav('left').close();
        };
        function goTo(state) {
            closeSideNavPanel();
            $state.go(state, {}, { reload: false });
            setPageTitle(state);
        }
        function goToDayScheduler() {
            closeSideNavPanel();
            $state.go('home.dayscheduler.daytemperatures', { 'day': TimeService.currentDay }, { reload: false });
            setPageTitle('home.dayscheduler.daytemperatures');
        }
        function showSettings() {
            closeSideNavPanel();
            var modalInstance = $uibModal.open({
                templateUrl: 'controllers/templates/SettingsForm.html',
                controller: 'SettingsController as vm',
                size: 'sm'
            });           
        }
        function logOut() {
            closeSideNavPanel();
            $state.go('home', {}, { reload: false });
            AuthenticationService.logOut();
        }
        function clean() {
            for (var i = 0; i < _eventHandlers.length; i++) {
                _eventHandlers[i]();
            }
        }

        init();

    }

    MainViewController.$inject = ['$rootScope', '$scope', '$mdSidenav', '$state', '$uibModal', 'AuthenticationService', 'UserService', 'TimeService'];

})();