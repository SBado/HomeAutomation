(function () {
    "use strict";

    angular.module('climateControl')
        .factory('ConfigService', ['SQLiteService', ConfigService]);

    function ConfigService(SQLiteService) {

        console.log('ConfigService instantiated');

        var self = this;

        function getConfig(key) {
            var promise = SQLiteService.configs().get({ key: key });
            return promise;
        }
        function createConfig(key, value) {
            return SQLiteService.configs().save({ key: key, value: value });
        }
        function updateConfig(key, value) {
            return SQLiteService.configs().update({ key: key, value: value });
        }
        function deleteConfig(key) {
            return SQLiteService.configs().delete({ key: key });
        }

        this.getConfig = getConfig;
        this.createConfig = createConfig;
        this.updateConfig = updateConfig;
        this.deleteConfig = deleteConfig;

        return this;
    }
})();