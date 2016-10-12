(function () {
    "use strict";

    angular.module('climateControl')
        .factory('UserService', ['$window', 'SQLiteService', UserService]);

    function UserService($window, SQLiteService) {

        console.log('UserService instantiated');

        var self = this;
        var currentUser = null;

        function validateUser(username, password) {
            var promise = SQLiteService.users().get({ username: username, password: password });
            return promise;
        }
        function createUser(username, password) {
            return SQLiteService.users().save({ username: username, password: password });
        }
        function updateUser(username, password) {
            return SQLiteService.users().update({ username: username, password: password });
        }
        function deleteUser(username) {
            return SQLiteService.users().delete({ username: username });
        }
        function getCurrentUser() {
            if (!currentUser && $window.sessionStorage['currentUser']) {
                currentUser = $window.sessionStorage['currentUser'];
            }
            return currentUser;
        }
        function setCurrentUser(username) {
            currentUser = username;
            $window.sessionStorage['currentUser'] = currentUser
        }
        function unsetCurrentUser() {
            currentUser = '';
            $window.sessionStorage.removeItem('currentUser');
        }

        this.validateUser = validateUser;
        this.createUser = createUser;
        this.updateUser = updateUser;
        this.deleteUser = deleteUser;
        this.getCurrentUser = getCurrentUser;
        this.setCurrentUser = setCurrentUser;
        this.unsetCurrentUser = unsetCurrentUser;

        return this;
    }
})();