﻿(function () {
    "use strict";

    angular.module('climateControl')
        .factory('UserService', ['$window', 'ModelService', UserService]);

    function UserService($window, ModelService) {

        console.log('UserService instantiated');

        var self = this;
        var loggedUser = null;

        function validateUser(username, password) {
            var promise = ModelService.users().get({ username: username, password: password });
            return promise;
        }
        function createUser(username, password) {
            return ModelService.users().save({ username: username, password: password });
        }
        function updateUser(username, password) {
            return ModelService.users().update({ username: username, password: password });
        }
        function deleteUser(username) {
            return ModelService.users().delete({ username: username });
        }
        function getLoggedUser() {
            if (!loggedUser && $window.sessionStorage['loggedUser']) {
                loggedUser = $window.sessionStorage['loggedUser'];
            }
            return loggedUser;
        }
        function setLoggedUser(username) {
            loggedUser = username;
            $window.sessionStorage['loggedUser'] = loggedUser
        }
        function unsetLoggedUser() {
            loggedUser = null;
            $window.sessionStorage.removeItem('loggedUser');
        }

        this.validateUser = validateUser;
        this.createUser = createUser;
        this.updateUser = updateUser;
        this.deleteUser = deleteUser;
        this.getLoggedUser = getLoggedUser;
        this.setLoggedUser = setLoggedUser;
        this.unsetLoggedUser = unsetLoggedUser;

        return this;
    }
})();