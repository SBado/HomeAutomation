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
            vm.signing = false;
            vm.logging = false;
            vm.error = false;
            vm.errorNumber = 0;
            vm.loading = false;
            vm.submit = submit;
        }
        function signup(credentials) {
            vm.error = false;
            vm.signing = true;
            vm.logging = false;
            vm.loading = true;
            AuthenticationService.signup(credentials, function (user) {
				vm.loading = false;				
                $uibModalInstance.close();
                $state.go('home.manualcontrol');
            }, function (errorNumber, errorMessage) {
            	vm.loading = false;            	
                vm.error = true;
                vm.errorNumber = errorNumber;
            });
        };        
        function login(credentials) {
            vm.error = false;
            vm.logging = true;
            vm.signing = false;
            vm.loading = true;
            AuthenticationService.login(credentials, function (user) {
            	vm.loading = false;            	
                $uibModalInstance.close();
                $state.go('home.manualcontrol');
            }, function (err) {
            	vm.loading = false;            	      
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