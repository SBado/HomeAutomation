(function () {
    'use strict';

    angular.module('climateControl')
           .controller('SettingsController', SettingsController)

    function SettingsController($rootScope, $scope, $state, $uibModalInstance, ConfigService) {

        var vm = this;
        var _oldMinTemp = -1;
        var _oldMaxTemp = -1;

        function init() {
            vm.settings = {};
            vm.settings.minTemp = 2;
            vm.settings.maxTemp = 35;
            vm.submit = submit;
            vm.cancel = cancel

            ConfigService.getConfig('minTemp').$promise.then(setMinTemp);
            ConfigService.getConfig('maxTemp').$promise.then(setMaxTemp);
        }
        function submit() {
            if (vm.settings.minTemp != _oldMinTemp)
                ConfigService.updateConfig('minTemp', vm.settings.minTemp).$promise.then(notifyMinTempChanged);
            if (vm.settings.maxTemp != _oldMaxTemp)
                ConfigService.updateConfig('maxTemp', vm.settings.maxTemp).$promise.then(notifyMaxTempChanged);
            $uibModalInstance.close();
        };
        function cancel() {
            $uibModalInstance.close();
        };
        function setMinTemp(temp) {
            _oldMinTemp = vm.settings.minTemp;
            vm.settings.minTemp = parseFloat(temp.data);
        }
        function setMaxTemp(temp) {
            _oldMaxTemp = vm.settings.maxTemp;
            vm.settings.maxTemp = parseFloat(temp.data);
        }
        function notifyMinTempChanged() {
            $rootScope.$emit('minTempChanged', vm.settings.minTemp);
        }
        function notifyMaxTempChanged() {
            $rootScope.$emit('maxTempChanged', vm.settings.maxTemp);
        }

        init();
    }

    SettingsController.$inject = ['$rootScope', '$scope', '$state', '$uibModalInstance', 'ConfigService'];

})();