(function () {
    'use strict';

    angular.module('climateControl')
           .controller('ParentController', ParentController)

    function ParentController($rootScope, $scope, $uibModal, AuthenticationService, AUTH_EVENTS, UserService) {       

        function init() {
            $scope.loginShown = false;
            $scope.loggedUser = {};
            $scope.loggedUser.name = UserService.getLoggedUser();             
            $scope.userAuthenticated = AuthenticationService.userAuthenticated;

            //listen to events of unsuccessful logins, to run the login dialog
            $rootScope.$on(AUTH_EVENTS.notAuthenticated, showLoginDialog);
            $rootScope.$on(AUTH_EVENTS.sessionTimeout, showLoginDialog);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, showLoginDialog);
            $rootScope.$on(AUTH_EVENTS.logoutSuccess, unsetLoggedUser);
            $rootScope.$on(AUTH_EVENTS.loginSuccess, setLoggedUser);
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
        function setLoggedUser() {        	 
            $scope.loggedUser.name = UserService.getLoggedUser();
        }
        function unsetLoggedUser() {
            $scope.loggedUser.name = null;           
        }

        init();
    }

    ParentController.$inject = ['$rootScope', '$scope', '$uibModal', 'AuthenticationService', 'AUTH_EVENTS', 'UserService'];

})();