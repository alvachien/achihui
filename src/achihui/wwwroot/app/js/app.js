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
          .state('home.learn.overview', {
              url: "",
              templateUrl: 'app/views/learnoverview.html',
              controller: 'LearnOverviewController'
          })
          .state('home.learn.pos', {
              url: "/pos",
              templateUrl: 'app/views/poslist.html',
              controller: 'POSListController'
          })
          .state('home.learn.word', {
              url: "/word",
              abstract: true,
              template: '<div ui-view></div>'
          })
          .state('home.learn.word.list', {
              url: "",
              templateUrl: 'app/views/wordlist.html',
              controller: 'WordListController'
          })
          .state('home.learn.sentence', {
              url: "/sentence",
              abstract: true,
              template: '<div ui-view></div>'
          })
          .state('home.learn.sentence.list', {
              url: "",
              templateUrl: 'app/views/sentencelist.html',
              controller: 'SentenceListController'
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

	.controller('POSListController', ['$scope', '$rootScope', '$state', '$http', '$log',
        function ($scope, $rootScope, $state, $http, $log) {
            $scope.arPOSList = [];
            $scope.dispList = [];

            $http.get('http://achihapi.azurewebsites.net/api/pos')
                .then(function (response) {
                    // The response object has these properties:
                    $scope.arPOSList = [];
                    if ($.isArray(response.data) && response.data.length > 0) {
                        $.each(response.data, function (idx, obj) {
                            $scope.arPOSList.push(obj);
                        });
                    }

                    $scope.dispList = [].concat($scope.arPOSList);
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