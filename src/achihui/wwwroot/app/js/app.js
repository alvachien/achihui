/* global $ */
/* global angular */
(function () {
    "use strict";

    angular.module('achihapp', ["ui.router", "ngAnimate", 'ui.bootstrap', 'ngSanitize',
		'pascalprecht.translate', 'ngTouch', 'chart.js', 'smart-table', 'selectize', 'achihapp.Utility'])

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
          .when('/todo', '/home/todo')

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
          .state('home.learn.word.create', {
              url: "/create",
              templateUrl: 'app/views/word.html',
              controller: 'WordController'
          })
          .state('home.learn.word.display', {
              url: "/display/:id",
              templateUrl: 'app/views/word.html',
              controller: 'WordController'
          })
          .state('home.learn.word.edit', {
              url: "/edit/:id",
              templateUrl: 'app/views/word.html',
              controller: 'WordController'
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
          .state('home.todo', {
              url: '/todo',
              abstract: true,
              template: '<div ui-view></div>'
          })
          .state('home.todo.list', {
              url: '',
              templateUrl: 'app/views/todolist.html',
              controller: 'TodoListController'
          })
          .state('home.todo.create', {
              url: '/create',
              templateUrl: 'app/views/todo.html',
              controller: 'TodoController'
          })
          .state('home.todo.edit', {
              url: '/edit',
              templateUrl: 'app/views/todo.html',
              controller: 'TodoController'
          })
          .state('home.todo.display', {
              url: '/display',
              templateUrl: 'app/views/todo.html',
              controller: 'TodoController'
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

		    $scope.settings = {
		        authority: "http://acidserver.azurewebsites.net/",
		        client_id: "achihui.js",
		        redirect_uri: "http://achihui.azurewebsites.net/logincallback.html",
		        response_type: "id_token token",
		        scope: "openid profile api.hihapi"
		    };
		    $scope.mgr = new Oidc.UserManager($scope.settings);
		    $rootScope.isLoggedIn = false;

		    if (angular.isDefined($rootScope.User) && $rootScope.User) {
		        $rootScope.isLoggedIn = true;
		    } else {
		        $scope.mgr.getUser().then(function (u) {
		            if (u) {
		                $log.info("User loaded", u);
		                $rootScope.User = u;
		                $rootScope.isLoggedIn = true;
		            }
		            else {
		                $log.info("no user loaded");
                    }
		        });
		    }

		    $scope.doLogin = function () {
		        $scope.mgr.signinRedirect().then(function () {
		            $log.info("redirecting for login...");
		        })
                .catch(function (er) {
                    $log.error("Sign-in error", er);
                });
		    }

		    $scope.doLogout = function () {
		        $scope.mgr.signoutRedirect().then(function () {
		            $log.info("redirecting for logout...");
		        })
                .catch(function (er) {
                    $log.error("Sign-out error", er);
                });
		    }

		    $scope.setLanguage = function (newlang) {
		        $log.info("Language change triggerd!");
		        $translate.use(newlang);
		    };

		    $scope.setTheme = function (newtheme) {
		        $log.info("Theme change triggerd!");

		        var realtheme = "";
		        if (newtheme && newtheme.length > 0) {
		            // Now replace the CSS
		            realtheme = newtheme;
		        } else {
		            // Go for default theme
		            realtheme = "default";
		        }
		        $rootScope.$broadcast('ThemeChange', realtheme);
		    };
		}])

	.controller('UserListController', ['$scope', '$rootScope', '$state', '$http', '$log',
        function ($scope, $rootScope, $state, $http, $log) {
    	}])

	.controller('POSListController', ['$scope', '$rootScope', '$state', '$http', '$log', 'utils',
        function ($scope, $rootScope, $state, $http, $log, utils) {
            $scope.dispList = [];

            $scope.refreshList = function () {
                utils.loadPOSQ()
                    .then(function (response) {
                        $scope.dispList = [].concat($rootScope.arPOS);
                    }, function (response) {
                        // Error occurs!
                    });
            };

            $scope.refreshList();
        }])

	.controller('WordListController', ['$scope', '$rootScope', '$state', '$http', '$log', '$q', 'utils',
        function ($scope, $rootScope, $state, $http, $log, $q, utils) {
            $scope.dispList = [];

            $scope.newItem = function () {
                var promise1 = utils.loadLanguagesQ();
                var promise2 = utils.loadPOSQ();
                $q.all([promise1, promise2])
                    .then(function (response) {
                        $state.go('home.learn.word.create');
                    }, function (reason) {
                    });
            };

            $scope.refreshList = function (bForeceRefresh) {
                utils.loadWordListQ(bForeceRefresh)
                    .then(function (response) {
                        $scope.dispList = [].concat($rootScope.arWord);
                    }, function (response) {
                        // Error occurs!
                    });
            };

            $scope.refreshList(false);

            // Display
            $scope.displayItem = function (row) {
                var nID = 0;
                if (row) {
                    nID = row.ID;
                } else {
                    for (var i = 0; i < $scope.dispList.length; i++) {
                        if ($scope.dispList[i].isSelected) {
                            nID = $scope.dispList[i].ID;
                            break;
                        }
                    }
                }

                var promise1 = utils.loadLanguagesQ();
                var promise2 = utils.loadPOSQ();
                $q.all([promise1, promise2])
                    .then(function (response) {
                        $state.go("home.learn.word.display", { id: nID });
                    }, function (reason) {
                    });                
            };

            // Edit
            $scope.editItem = function (row) {
                var nID = 0;
                if (row) {
                    nID = row.ID;
                } else {
                    for (var i = 0; i < $scope.dispList.length; i++) {
                        if ($scope.dispList[i].isSelected) {
                            nID = $scope.dispList[i].ID;
                            break;
                        }
                    }
                }

                var promise1 = utils.loadLanguagesQ();
                var promise2 = utils.loadPOSQ();
                $q.all([promise1, promise2])
                    .then(function (response) {
                        $state.go("home.learn.word.change", { id: nID });
                    }, function (reason) {
                    });
            };
        }])

	.controller('WordController', ['$scope', '$rootScope', '$state', '$stateParams', '$http', '$log', '$q', 'utils',
        function ($scope, $rootScope, $state, $stateParams, $http, $log, $q, utils) {
            var promise1 = utils.loadLanguagesQ();
            var promise2 = utils.loadPOSQ();
            $q.all([promise1, promise2])
                .then(function (response) {
                }, function(reason) {
                });

            $scope.Activity = "Common.Create"; // Default
            $scope.ActivityID = 1;
            $scope.ItemActivity = "Learning.ExplainCreate";
            $scope.WordObject = {};
            $scope.SelectedExplain = new hih.WordExplain();
            $scope.Explains = [];
            $scope.isReadonly = false;
            $scope.dispCollection = [].concat($scope.Explains);

            // Reported message
            $scope.ReportedMessages = [];
            $scope.cleanReportMessages = function () {
                $scope.ReportedMessages = [];
            };

            // Selection control for Tags
            $scope.arTags = [];
            $scope.tagsConfig = {
                create: true,
                onChange: function (value) {
                    $log.info('WordController, Tags control, event onChange, ', value);
                },
                maxItems: 10
            };

            // Selection control for POS
            $scope.posConfig = {
                create: false,
                onChange: function (value) {
                    $log.info('WordController, POS control, event onChange, ', value);
                },
                valueField: 'POSAbb',
                labelField: 'POSName',
                maxItems: 1,
                required: true
            };

            // Selection control for Lang
            $scope.langConfig = {
                create: false,
                onChange: function (value) {
                    $log.info('WordController, Lang control, event onChange, ', value);
                },
                valueField: 'LCID',
                labelField: 'NativeName',
                maxItems: 1,
                required: true
            };

            if (angular.isDefined($stateParams.id)) {
                if ($state.current.name === "home.learn.word.edit") {
                    $scope.Activity = "Common.Edit";
                    $scope.ActivityID = 2;
                } else if ($state.current.name === "home.learn.word.display") {
                    $scope.Activity = "Common.Display";
                    $scope.isReadonly = true;
                    $scope.ActivityID = 3;
                }

                var nID = parseInt($stateParams.id);
                // Read the ID out
                $http.get('http://achihapi.azurewebsites.net/api/word/' + $stateParams.id)
                    .then(function (response) {

                    }, function (response) {
                        // Error occurs!
                    });
            } else {
                // Create a word
                $scope.WordObject = new hih.EnWord();
            }

            $scope.nextItemID = 0;
            $scope.updateNextItemID = function () {
                if (angular.isArray($scope.Explains) && $scope.Explains.length > 0) {
                    $scope.nextItemID = 0;

                    $.each($scope.Explains, function (idx, obj) {
                        var nItemID = parseInt(obj.ExplainID);

                        if ($scope.nextItemID < nItemID) {
                            $scope.nextItemID = nItemID;
                        }
                    });

                    $scope.nextItemID++;
                } else {
                    $scope.nextItemID = 1;
                }
            };

            $scope.saveCurrentItem = function () {
                $scope.cleanReportMessages();

                // Perform the check
                var rptMsgs = $scope.SelectedExplain.verify();
                if ($.isArray(rptMsgs) && rptMsgs.length > 0) {
                    //    $q.all(rptMsgs)
                    //		.then(function (response) {
                    //		    $scope.cleanReportMessages();
                    //		    Array.prototype.push.apply($scope.ReportedMessages, response);
                    //		}, function (reason) {
                    //		    $rootScope.$broadcast("ShowMessageEx", "Error", [{ Type: 'danger', Message: "Fatal error on loading texts!" }]);
                    //		});
                    return;
                }

                if ($scope.SelectedExplain.ExplainID === -1) {
                    $scope.updateNextItemID();
                    $scope.SelectedExplain.ExplainID = $scope.nextItemID;
                    $scope.Explains.push($scope.SelectedExplain);
                } else {
                    // Update the selected one
                    // It is updated automatically? Yes, it is!
                }

                // New detail
                $scope.SelectedExplain = new hih.WordExplain();
                $scope.ItemActivity = "Learning.ExplainCreate";
            };
            $scope.cancelCurrentItem = function () {
                $scope.cleanReportMessages();

                $scope.SelectedExplain = new hih.WordExplain();
                $scope.ItemActivity = "Learning.ExplainCreate";
            };

            $scope.submit = function () {
                if ($.isArray($scope.Explains) && $scope.Explains.length > 0) {
                    $scope.WordObject.Explains = [];

                    $.each($scope.Explains, function (idx, obj) {
                        $scope.WordObject.Explains.push(obj);
                    });
                }
                var msgs = $scope.WordObject.verify();
                if ($.isArray(msgs) && msgs.length > 0) {

                }

                utils.createWordQ($scope.WordObject)
                    .then(function (response) {
                        if (hih.Constants.IsConsoleLog) {
                            $log.info("Create Word Succeed.");
                        }
                    }, function (reason) {
                    }
                    );
            };
        }])

	.controller('SentenceListController', ['$scope', '$rootScope', '$state', '$http', '$log', 'utils',
        function ($scope, $rootScope, $state, $http, $log, utils) {

            $scope.refreshList = function () {
                utils.loadSentenceListQ()
                    .then(function (response) {
                    }, function (response) {
                        // Error occurs!
                    });
            };

            $scope.refreshList();
        }])

	.controller('TodoListController', ['$scope', '$rootScope', '$state', '$http', '$log', 'utils',
        function ($scope, $rootScope, $state, $http, $log, utils) {
            $scope.arTodoList = [];
            $scope.dispList = [];

            $scope.refreshList = function () {
                $http.get('http://achihapi.azurewebsites.net/api/todo')
                    .then(function (response) {
                        // The response object has these properties:
                        $scope.arTodoList = [];
                        if ($.isArray(response.data) && response.data.length > 0) {
                            $.each(response.data, function (idx, obj) {
                                $scope.arTodoList.push(obj);
                            });
                        }

                        $scope.dispList = [].concat($scope.arTodoList);
                    }, function (response) {
                        // Error occurs!
                    });
            };
        }])

	.controller('TodoController', ['$scope', '$rootScope', '$state', '$http', '$log', 'utils',
        function ($scope, $rootScope, $state, $http, $log, utils) {
        }])

	.controller('AboutController', ['$scope', '$rootScope', 'utils',
        function ($scope, $rootScope) {
        // Do nothing!
	    }])
    ;
})();