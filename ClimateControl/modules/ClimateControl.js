(function () {
    var app = angular.module('climateControl', ['ngRoute', 'ngResource', 'ngAnimate', 'ngMaterial', 'ui.router', 'ui.bootstrap', 'ui.bootstrap.contextMenu', 'ui.validate', 'angular-confirm', 'angular-cache', 'LocalStorageModule']);

    //https://github.com/alarv/ng-login
    app.constant('AUTH_EVENTS', {
        loginSuccess: 'auth-login-success',
        loginFailed: 'auth-login-failed',
        logoutSuccess: 'auth-logout-success',
        sessionTimeout: 'auth-session-timeout',
        notAuthenticated: 'auth-not-authenticated'
    })

    app.config(function ($httpProvider) {
        $httpProvider.interceptors.push('HttpInterceptor', 'AuthInterceptor');
        //$httpProvider.interceptors.push('AuthInterceptor');
    });

    app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

        // For any unmatched url, redirect to /state1
        $urlRouterProvider.otherwise("/home/manualcontrol");

        $stateProvider
          .state('home', {
              url: "/home",
              views: {
                  'main-view': {
                      templateUrl: "directives/elements/templates/MainView.html",
                      controller: 'MainViewController',
                      controllerAs: 'vm'
                  }
              }
          })
          .state('home.manualcontrol', {
              url: "/manualcontrol",
              views: {
                  'schedulers': {
                      templateUrl: "directives/elements/templates/BoilerControl.html",
                      controller: 'BoilerControlController',
                      controllerAs: 'vm',
                      resolve: {
                          roomTemperature: ['TemperatureService', function (TemperatureService) {
                              return TemperatureService.roomTemperature;
                          }],
                          manualBoilerTemperature: ['ConfigService', function (ConfigService) {
                              return ConfigService.getConfig('manualBoilerTemperature').$promise;
                          }],
                          manualMode: ['ConfigService', function (ConfigService) {
                              return ConfigService.getConfig('manualMode').$promise;
                          }]
                      }
                  }
              }
          })
          .state('home.dayscheduler', {
              // url: "/dayscheduler",
              views: {
                  'schedulers': {
                      templateUrl: "directives/elements/templates/DayScheduler.html",
                      //controller: 'DaySchedulerController',
                      //controllerAs: 'vm'                     
                  }
              }
          })
            .state('home.dayscheduler.daytemperatures', {
                url: "/dayscheduler/:day",
                views: {
                    'dayschedule': {
                        //templateUrl: 'components/DayTemperatures.html',
                        //controller: 'DayTemperaturesController',
                        //controllerAs: 'vm',
                        template: '<day-temperatures></day-temperatures>',
                        params: {
                            day: null
                        },
                        resolve: {
                            values: ['SQLiteService', '$stateParams', function (SQLiteService, $stateParams) {
                                var day = '';
                                if ($stateParams.day != null && $stateParams.day != '') {
                                    day = $stateParams.day;
                                }
                                else {
                                    var now = new Date();
                                    var days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                                    day = days[now.getDay() - 1];
                                }
                                return SQLiteService.daily_temps().get({ day: day }).$promise;
                            }]
                        },
                        controller: function ($scope, values) {
                            $scope.values = values;
                        },
                    }
                }
            })
          .state('home.weekscheduler', {
              url: "/weekscheduler",
              views: {
                  'schedulers': {
                      templateUrl: 'directives/elements/templates/WeekScheduler.html',
                      controller: 'WeekSchedulerController',
                      controllerAs: 'vm',
                      resolve: {
                          temperatures: function (SQLiteService) {
                              return SQLiteService.daily_temps().get().$promise;
                          }
                      }
                  }
              }
          })
          .state('home.monthscheduler', {
              url: "/monthscheduler",
              views: {
                  'schedulers': {
                      templateUrl: 'directives/elements/templates/MonthScheduler.html',
                      controller: 'MonthSchedulerController',
                      controllerAs: 'vm',
                      resolve: {
                          scheduledDays: function (SQLiteService) {
                              return SQLiteService.scheduled_days().get().$promise;
                          }
                      }
                  }
              }
          })
    }]);

    app.run(function ($http, CacheFactory) {
        $http.defaults.cache = CacheFactory('defaultCache', {});
    });

    app.run(function ($rootScope, $state, AuthenticationService, AUTH_EVENTS) {

        //before each state change, check if the user is logged in
        //and authorized to move onto the next state
        $rootScope.$on('$stateChangeStart', function (event, next) {
            if (!AuthenticationService.userAuthenticated()) {
                // user is not authenticated
                if (next.name == 'home') {
                    $rootScope.$broadcast(AUTH_EVENTS.notAuthenticated);
                    return;
                }
                event.preventDefault();
                $state.go('home', {}, { reload: false });
            }
            else
                $rootScope.loadingView = true;
        });

        $rootScope.$on('$stateChangeSuccess', function (e, curr, prev) {
            // Hide loading message
            $rootScope.loadingView = false;
        });

        ///* To show current active state on menu */
        //$rootScope.getClass = function (path) {
        //    if ($state.current.name == path) {
        //        return "active";
        //    } else {
        //        return "";
        //    }
        //}       
    });
})();