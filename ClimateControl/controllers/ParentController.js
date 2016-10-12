(function () {
    'use strict';

    angular.module('climateControl')
           .controller('ParentController', ParentController)

    function ParentController($rootScope, $scope, $uibModal, AuthenticationService, AUTH_EVENTS, UserService) {       

        function init() {
            $scope.loginShown = false;
            $scope.currentUser = null;
            $scope.userAuthenticated = AuthenticationService.userAuthenticated;

            //listen to events of unsuccessful logins, to run the login dialog
            $rootScope.$on(AUTH_EVENTS.notAuthenticated, showLoginDialog);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, showLoginDialog);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, showLoginDialog);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, unsetCurrentUser);
            $rootScope.$on(AUTH_EVENTS.loginSuccess, setCurrentUser);
        }
        function showLoginDialog() {
            if (!$scope.loginShown) {
                $scope.loginShown = true;
                var modalInstance = $uibModal.open({
                    templateUrl: 'controllers/templates/LoginForm.html',
                    controller: 'LoginController as vm',
                    backdrop: 'static'
                });

                modalInstance.result.then(function () {
                    $scope.loginShown = false;
                });
            }
        };
        function setCurrentUser() {
            $scope.currentUser = UserService.getCurrentUser();
        }
        function unsetCurrentUser() {
            $scope.currentUser = '';
            UserService.unsetCurrentUser();
        }

        init();
    }

    ParentController.$inject = ['$rootScope', '$scope', '$uibModal', 'AuthenticationService', 'AUTH_EVENTS', 'UserService'];

})();