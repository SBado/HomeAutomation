(function () {
    "use strict";

    angular.module("climateControl")
        .factory("SQLiteService", ['$http', '$resource', 'CacheFactory', 'TokenService', SQLiteService]);

    function SQLiteService($http, $resource, CacheFactory, TokenService) {

        console.log('SQLiteService instantiated');       

        this.daily_temps = function () {

            var resource = $resource('api/daily_temps/:day/:hour/:temperature/', { day: '@day', hour: '@hour', temperature: '@temperature' },
                {
                    'get': {
                        method: 'GET',
                        cache: true
                    },
                    'update': { method: 'PUT' }
                });
            resource = TokenService.wrapActions(resource, ['get', 'update']);
            return resource;
        }

        this.scheduled_temps = function () {

            var resource = $resource('api/scheduled_temps/:timespan/:temperatures/', { timespan: '@timespan', temperatures: '@temperatures' },
                {
                    'get': {
                        method: 'GET',
                        cache: true
                    },
                    'update': { method: 'PUT' }
                });
            resource = TokenService.wrapActions(resource, ['get', 'save', 'update', 'delete']);
            return resource;
        }

        this.scheduled_days = function () {

            var resource = $resource('api/scheduled_days/', { },
                {
                    'get': {
                        method: 'GET',
                        cache: false
                    }
                });
            resource = TokenService.wrapActions(resource, ['get']);
            return resource;
        }

        this.configs = function () {

            var resource = $resource('api/configs/:key/:value/', { key: '@key', value: '@value' },
                 {
                     'get': {
                         method: 'GET',
                         cache: true
                     },
                     'update': { method: 'PUT' }
                 });
            resource = TokenService.wrapActions(resource, ['get', 'save', 'update', 'delete']);
            return resource;
        }

        this.users = function () {

            var resource = $resource('api/users/:username/:password/', { username: '@username', password: '@password' },
                 {
                     'get': {
                         method: 'GET',
                         cache: true
                     },
                     'update': { method: 'PUT' }
                 });
            resource = TokenService.wrapActions(resource, ['get', 'save', 'update', 'delete']);
            return resource;
        }

        return this;
    }

})();