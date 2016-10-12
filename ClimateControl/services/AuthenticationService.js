(function () {
    "use strict";

    angular.module("climateControl")
        .factory("AuthenticationService", ['$rootScope', '$http', 'UserService', 'TokenService', 'AUTH_EVENTS', AuthenticationService]);

    function AuthenticationService($rootScope, $http, UserService, TokenService, AUTH_EVENTS) {

        console.log('AuthenticationService instantiated');

        var self = this;

        function generateHashedPassword(username, password) {
            var salt = sjcl.hash.sha256.hash(username + password);
            var hashedPassword = sjcl.hash.sha256.hash(salt + password);
            return sjcl.codec.hex.fromBits(hashedPassword);
        }

        self.signup = function (user, success, error) {
            var hashedPassword = generateHashedPassword(user.username, user.password);
            UserService.createUser(user.username, hashedPassword).$promise.then(function (result) {
                if (result.error) {
                	  error(result.error.errnum, result.error.errmsg);
                	  return;
                }
                self.login(user, success, error);
            }, function (error) { console.log(error) });
        }
        self.login = function (user, success, error) {
            var hashedPassword = generateHashedPassword(user.username, user.password);
            var credentials = btoa(user.username + ':' + hashedPassword)
            var promise = $http.post(
                'php/TokenGeneration.php',
                {
                    grant_type: 'client_credentials'
                },
                {
                    headers: { 'Authorization': 'Basic ' + credentials }
                }
            );
            promise.then(function successCallback(response) {
                TokenService.setToken(response.data.access_token);
                UserService.setCurrentUser(user.username);
                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
                success(response.data.access_token);
            }, function errorCallback(e) {
                console.log(e);
                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
                error(e);
            });

            return promise;
        }
        //check if the user is authenticated
        self.userAuthenticated = function () {
            return TokenService.getToken() != '';
        };
        //log out the user and broadcast the logoutSuccess event
        self.logOut = function () {
            TokenService.deleteToken();
            UserService.unsetCurrentUser();
            $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
        }

        return self;

        //var authService = {};

        //the login function
        //authService.login = function (user, success, error) {
        //    $http.post('misc/users.json').success(function (data) {

        //        //this is my dummy technique, normally here the 
        //        //user is returned with his data from the db
        //        var users = data.users;
        //        if (users[user.username]) {
        //            var loginData = users[user.username];
        //            //insert your custom login function here 
        //            if (user.username == loginData.username && user.password == loginData.username) {
        //                //set the browser session, to avoid relogin on refresh
        //                $window.sessionStorage["userInfo"] = JSON.stringify(loginData);

        //                //delete password not to be seen clientside 
        //                delete loginData.password;

        //                //update current user into the Session service or $rootScope.currentUser
        //                //whatever you prefer
        //                Session.create(loginData);
        //                //or
        //                $rootScope.currentUser = loginData;

        //                //fire event of successful login
        //                $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        //                //run success function
        //                success(loginData);
        //            } else {
        //                //OR ELSE
        //                //unsuccessful login, fire login failed event for 
        //                //the according functions to run
        //                $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        //                error();
        //            }
        //        }
        //    });

        //};



        //check if the user is authorized to access the next route
        //this function can be also used on element level
        //e.g. <p ng-if="isAuthorized(authorizedRoles)">show this only to admins</p>
        //authService.isAuthorized = function (authorizedRoles) {
        //    if (!angular.isArray(authorizedRoles)) {
        //        authorizedRoles = [authorizedRoles];
        //    }
        //    return (authService.isAuthenticated() &&
        //      authorizedRoles.indexOf(Session.userRole) !== -1);
        //};

    }

})();