/* global $ */
/* global angular */
(function () {
    "use strict";

    angular.module('achihapp', ["ui.router", "ngAnimate", 'ui.bootstrap', 'ngSanitize',
		'pascalprecht.translate', 'ngTouch', 'chart.js'])

		.run(['$rootScope', '$state', '$stateParams', '$timeout', '$http', '$log',
            function ($rootScope, $state, $stateParams, $timeout, $http, $log) {
                $rootScope.$state = $state;
                $rootScope.$stateParams = $stateParams;
            }
		])

	.config(['$stateProvider', '$urlRouterProvider', '$translateProvider', function ($stateProvider, $urlRouterProvider, $translateProvider) {

	    /////////////////////////////
	    // Redirects and Otherwise //
	    /////////////////////////////

	    // Use $urlRouterProvider to configure any redirects (when) and invalid urls (otherwise).
	    $urlRouterProvider

          // The `when` method says if the url is ever the 1st param, then redirect to the 2nd param
          .when('/welcome', '/home')
          .when('/about', '/home/about')
          .when('/learn', '/home/learn')
          .when('/commandhit', '/home/commandhit')
          .when('/errortracestatus', '/home/errortracestatus')
          .when('/errortrace', '/home/errortrace')

          // If the url is ever invalid, e.g. '/asdf', then redirect to '/' aka the home state
          .otherwise('/home');

	    //////////////////////////
	    // State Configurations //
	    //////////////////////////

	    // Use $stateProvider to configure your states.
	    $stateProvider

          .state("home", {
              url: "/home",
              abstract: true,
              templateUrl: 'app/views/home.html',
              controller: 'HomeController',
              //data: {
              //    rule: function ($rootScope) {
              //        if (!angular.isDefined($rootScope.isLogin)) return false;

              //        return $rootScope.isLogin;
              //    }
              //},

              onEnter: function ($rootScope) {
                  console.log('HIH Home: Entering page!');
              }
          })
          .state('home.welcome', {
              url: '',
              templateUrl: 'app/views/welcome.html'
          })
          .state('home.learn', {
              url: "/learn",
              abstract: true,
              template: '<div ui-view></div>'
          })
          .state('home.learn.word', {
              url: "",
              templateUrl: 'app/views/commandlist.html',
              controller: 'CommandListController'
          })
          .state('home.commandhit', {
              url: "/commandhit",
              abstract: true,
              template: '<div ui-view></div>'
          })
          .state('home.commandhit.list', {
              url: "",
              templateUrl: 'app/views/commandhitlist.html',
              controller: 'CommandHitListController'
          })
          .state('home.errortrace', {
              url: "/errortrace",
              abstract: true,
              template: '<div ui-view></div>'
          })
          .state('home.errortrace.list', {
              url: "",
              templateUrl: 'app/views/errortracelist.html',
              controller: 'ErrorTraceListController'
          })
          .state('home.errortracestatus', {
              url: "/errortracestatus",
              abstract: true,
              template: '<div ui-view></div>'
          })
          .state('home.errortracestatus.list', {
              url: "",
              templateUrl: 'app/views/errortracestatuslist.html',
              controller: 'ErrorTraceStatusListController'
          })
          .state('home.userdetail', {
              url: '/userdetail',
              templateUrl: 'app/views/userdetail.html'
          })
          .state('home.about', {
              url: '/about',
              templateUrl: 'app/views/about.html',
              controller: 'AboutController'
          });

	    // Translate configurations
	    $translateProvider.useStaticFilesLoader({
	        files: [{
	            prefix: 'locales/',
	            suffix: '.json'
	        }]
	    });

	    // Enable escaping of HTML
	    $translateProvider.useSanitizeValueStrategy('escaped');
	    $translateProvider.registerAvailableLanguageKeys(['en', 'zh'], {
	        'en_US': 'en',
	        'en_UK': 'en',
	        'zh_CN': 'zh',
	        'zh-CN': 'zh'
	    })
		  .determinePreferredLanguage()
		  //.preferredLanguage('zh')
		  .fallbackLanguage('en');
	}])

	.controller('MainController', ['$scope', '$rootScope', '$log', '$translate', '$uibModal',
        function ($scope, $rootScope, $log, $translate, $uibModal) {
        }])

	.controller('HomeController', ['$scope', '$rootScope', '$state', '$stateParams', '$http', '$log', '$translate', '$q',
		function ($scope, $rootScope, $state, $stateParams, $http, $log, $translate, $q) {
		}])

	.controller('UserListController', ['$scope', '$rootScope', '$state', '$http', '$log',
        function ($scope, $rootScope, $state, $http, $log) {
    	}])

	.controller('CommandListController', ['$scope', '$rootScope', '$state', '$http', '$log',
        function ($scope, $rootScope, $state, $http, $log) {
            $scope.arCommandList = [];
            $scope.dispList = [];

            $http.get('http://qianh-pc2a:3500/api/command')
                .then(function (response) {
                    // The response object has these properties:
                    $scope.arCommandList = [];
                    if ($.isArray(response.data) && response.data.length > 0) {
                        $.each(response.data, function (idx, obj) {
                            $scope.arCommandList.push(obj);
                        });
                    }

                    $scope.dispList = [].concat($scope.arCommandList);
                }, function (response) {
                    // Error occurs!
                });
        }])

	.controller('CommandHitListController', ['$scope', '$rootScope', '$state', '$http', '$log',
        function ($scope, $rootScope, $state, $http, $log) {
            $scope.arCommandHitList = [];
            $scope.dispList = [];

            $http.get('http://qianh-pc2a:3500/api/commandhit')
                .then(function (response) {
                    // The response object has these properties:
                    $scope.arCommandHitList = [];
                    if ($.isArray(response.data) && response.data.length > 0) {
                        $.each(response.data, function (idx, obj) {
                            $scope.arCommandHitList.push(obj);
                        });
                    }

                    $scope.dispList = [].concat($scope.arCommandHitList);
                }, function (response) {
                    // Error occurs!
                });
        }])

	.controller('ErrorTraceListController', ['$scope', '$rootScope', '$state', '$http', '$log',
        function ($scope, $rootScope, $state, $http, $log) {
            $scope.arErrorTraceList = [];
            $scope.dispList = [];

            $http.get('http://qianh-pc2a:3500/api/errortrace')
                .then(function (response) {
                    // The response object has these properties:
                    $scope.arErrorTraceList = [];
                    if ($.isArray(response.data) && response.data.length > 0) {
                        $.each(response.data, function (idx, obj) {
                            $scope.arErrorTraceList.push(obj);
                        });
                    }

                    $scope.dispList = [].concat($scope.arErrorTraceList);
                }, function (response) {
                    // Error occurs!
                });
        }])

	.controller('ErrorTraceStatusListController', ['$scope', '$rootScope', '$state', '$http', '$log',
        function ($scope, $rootScope, $state, $http, $log) {
            $scope.arErrorTraceStatusList = [];
            $scope.dispList = [];

            $http.get('http://qianh-pc2a:3500/api/errortracestatus')
                .then(function (response) {
                    // The response object has these properties:
                    $scope.arErrorTraceStatusList = [];
                    if ($.isArray(response.data) && response.data.length > 0) {
                        $.each(response.data, function (idx, obj) {
                            $scope.arErrorTraceStatusList.push(obj);
                        });
                    }

                    $scope.dispList = [].concat($scope.arErrorTraceStatusList);
                }, function (response) {
                    // Error occurs!
                });
        }])

	.controller('AboutController', ['$scope', '$rootScope', function ($scope, $rootScope) {
        // Do nothing!
	    }])
    ;
})();