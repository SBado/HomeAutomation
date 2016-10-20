(function () {
    "use strict";

    angular.module('climateControl')
        .factory('ConfigService', ['ModelService', ConfigService]);

    function ConfigService(ModelService) {

        console.log('ConfigService instantiated');

        var self = this;

        function getConfig(key) {
            var promise = ModelService.configs().get({ key: key });
            return promise;
        }
        function createConfig(key, value) {
            return ModelService.configs().save({ key: key, value: value });
        }
        function updateConfig(key, value) {
            return ModelService.configs().update({ key: key, value: value });
        }
        function deleteConfig(key) {
            return ModelService.configs().delete({ key: key });
        }

        this.getConfig = getConfig;
        this.createConfig = createConfig;
        this.updateConfig = updateConfig;
        this.deleteConfig = deleteConfig;

        return this;
    }
})();