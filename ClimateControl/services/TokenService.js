(function () {
    "use strict";

    angular.module("climateControl")
        .factory("TokenService", ['$window', TokenService]);

    function TokenService($window) {

        console.log('TokenService instantiated');

        var tokenHandler = {};
        var token = '';

        tokenHandler.setToken = function (newToken) {
            token = newToken;
            $window.sessionStorage["accessToken"] = token
        };

        tokenHandler.getToken = function () {
            if (!token && $window.sessionStorage["accessToken"]) {
                token = $window.sessionStorage["accessToken"];
            }
            return token;
        };

        tokenHandler.deleteToken = function () {
            token = '';
            $window.sessionStorage.removeItem("accessToken");
        }

        // wrap given actions of a resource to send auth token with every
        // request
        tokenHandler.wrapActions = function (resource, actions) {
            // copy original resource
            var wrappedResource = resource;
            for (var i = 0; i < actions.length; i++) {
                tokenWrapper(wrappedResource, actions[i]);
            };
            // return modified copy of resource
            return wrappedResource;
        };

        // wraps resource action to send request with auth token
        var tokenWrapper = function (resource, action) {
            // copy original action
            resource['_' + action] = resource[action];
            // create new action wrapping the original and sending token
            resource[action] = function (params, data, success, error) {
                return resource['_' + action](
                  angular.extend({}, params || {}, { access_token: tokenHandler.getToken() }),
                  data,
                  success,
                  error
                );
            };
        };

        return tokenHandler;
    }

})();