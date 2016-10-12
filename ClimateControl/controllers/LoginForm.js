//https://github.com/alarv/ng-login

(function () {
    'use strict';

    angular.module('climateControl')
           .controller('LoginController', LoginController)

    function LoginController($scope, $state, $uibModalInstance, AuthenticationService) {

        var vm = this;
     
        function init() {
            vm.signupMode = false;
            vm.credentials = {};
            vm.loginForm = {};
            vm.error = false;
            vm.errorNumber = 0;
            vm.submit = submit;
        }
        function signup(credentials) {
            vm.error = false;
            AuthenticationService.signup(credentials, function (user) {
                $uibModalInstance.close();
                $state.go('home.manualcontrol');
            }, function (errorNumber, errorMessage) {
                vm.error = true;
                vm.errorNumber = errorNumber;
            });
        };        
        function login(credentials) {
            vm.error = false;
            AuthenticationService.login(credentials, function (user) {
                $uibModalInstance.close();
                $state.go('home.manualcontrol');
            }, function (err) {                
                vm.error = true;
            });
        };
        function submit() {
            vm.submitted = true;
            if (vm.loginForm.$valid && vm.signupMode) {
                signup(vm.credentials);
            }
            else if (vm.loginForm.$valid && !vm.signupMode) {
                login(vm.credentials);
            }            
        };

        init();
    }

    LoginController.$inject = ['$scope', '$state', '$uibModalInstance', 'AuthenticationService'];

})();