/* global $ */
/* global angular */
(function () {
    "use strict";

    angular.module('achihapp', ["ui.router", "ngAnimate", 'ui.bootstrap', 'ngSanitize',
		'pascalprecht.translate', 'ngTouch', 'chart.js', 'smart-table', 'selectize', 'achihapp.Utility', 'ui.tinymce'])

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
          .state('home.learn.knowledgetype', {
              url: "/knowledgetype",
              abstract: true,
              template: '<div ui-view></div>'
          })
          .state('home.learn.knowledgetype.list', {
              url: "",
              templateUrl: 'app/views/knowledgetypelist.html',
              controller: 'KnowledgeTypeListController'
          })
          .state('home.learn.knowledgetype.create', {
              url: "/create",
              templateUrl: 'app/views/knowledgetype.html',
              controller: 'KnowledgeTypeController'
          })
          .state('home.learn.knowledgetype.display', {
              url: "/display/:id",
              templateUrl: 'app/views/knowledgetype.html',
              controller: 'KnowledgeTypeController'
          })
          .state('home.learn.knowledgetype.edit', {
              url: "/edit/:id",
              templateUrl: 'app/views/knowledgetype.html',
              controller: 'KnowledgeTypeController'
          })
          .state('home.learn.knowledge', {
              url: "/knowledge",
              abstract: true,
              template: '<div ui-view></div>'
          })
          .state('home.learn.knowledge.list', {
              url: "",
              templateUrl: 'app/views/knowledgelist.html',
              controller: 'KnowledgeListController'
          })
          .state('home.learn.knowledge.create', {
              url: "/create",
              templateUrl: 'app/views/knowledge.html',
              controller: 'KnowledgeController'
          })
          .state('home.learn.knowledge.display', {
              url: "/display/:id",
              templateUrl: 'app/views/knowledge.html',
              controller: 'KnowledgeController'
          })
          .state('home.learn.knowledge.edit', {
              url: "/edit/:id",
              templateUrl: 'app/views/knowledge.html',
              controller: 'KnowledgeController'
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
		        authority: hih.Constants.IdSrvURL,
		        client_id: "achihui.js",
		        redirect_uri: hih.Constants.IdSrvLoginRedirURL,
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
		        var logoutsettings = {
		            authority: hih.Constants.IdSrvURL,
		            client_id: "achihui.js",
		            redirect_uri: hih.Constants.IdSrvLogoutRedirURL,
		            response_type: "id_token token",
		            scope: "openid profile api.hihapi"
		        };
		        var logoutmgr = new Oidc.UserManager(logoutsettings);
		        logoutmgr.signoutRedirect().then(function () {
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
                var promise1 = utils.loadLanguagesQ(false);
                var promise2 = utils.loadPOSQ(false);
                $q.all([promise1, promise2])
                    .then(function (response) {
                        $state.go('home.learn.word.create');
                    }, function (reason) {
                        // Todo
                    });
            };

            $scope.refreshList = function (bForeceRefresh) {
                utils.loadWordListQ(bForeceRefresh)
                    .then(function (response) {
                        $scope.dispList = [].concat($rootScope.arWord);
                    }, function (response) {
                        // Error occurs!
                        // Todo
                    });
            };

            $scope.refreshList(false);

            // Display
            $scope.displayItem = function (row) {
                var nID = 0;
                if (row) {
                    nID = row.wordID;
                } else {
                    for (var i = 0; i < $scope.dispList.length; i++) {
                        if ($scope.dispList[i].isSelected) {
                            nID = $scope.dispList[i].wordID;
                            break;
                        }
                    }
                }

                if (nID) {
                    var promise1 = utils.loadLanguagesQ();
                    var promise2 = utils.loadPOSQ();
                    $q.all([promise1, promise2])
                        .then(function (response) {
                            $state.go("home.learn.word.display", { id: nID });
                        }, function (reason) {
                        });
                }
            };

            // Edit
            $scope.editItem = function (row) {
                var nID = 0;
                if (row) {
                    nID = row.wordID;
                } else {
                    for (var i = 0; i < $scope.dispList.length; i++) {
                        if ($scope.dispList[i].isSelected) {
                            nID = $scope.dispList[i].wordID;
                            break;
                        }
                    }
                }

                if (nID) {
                    var promise1 = utils.loadLanguagesQ();
                    var promise2 = utils.loadPOSQ();
                    $q.all([promise1, promise2])
                        .then(function (response) {
                            $state.go("home.learn.word.change", { id: nID });
                        }, function (reason) {
                            // Todo
                        });
                }
            };
        }])

	.controller('WordController', ['$scope', '$rootScope', '$state', '$stateParams', '$http', '$log', '$q', 'utils',
        function ($scope, $rootScope, $state, $stateParams, $http, $log, $q, utils) {

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
            $scope.tags = [];
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
                valueField: 'ISOName',
                labelField: 'NativeName',
                maxItems: 1,
                required: true
            };

            var promise1 = utils.loadLanguagesQ(false);
            var promise2 = utils.loadPOSQ(false);
            $q.all([promise1, promise2])
                .then(function (response) {
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
                                if ($scope.WordObject.tags) {
                                    $scope.tags = $scope.WordObject.tags.split(hih.Constants.IDSplitChar);
                                }
                            }, function (response) {
                                // Error occurs!
                            });
                    } else {
                        // Create a word
                        $scope.WordObject = new hih.EnWord();
                    }


                }, function (reason) {
                });

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

                if ($scope.SelectedExplain.explainID === 0) {
                    $scope.updateNextItemID();
                    $scope.SelectedExplain.explainID = $scope.nextItemID;
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

                $scope.WordObject.tags = $scope.tags.join(hih.Constants.IDSplitChar);

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

    .controller('KnowledgeTypeListController', ['$scope', '$rootScope', '$state', '$log', '$q', 'utils',
        function ($scope, $rootScope, $state, $log, $q, utils) {

            $scope.dispList = [];

            $scope.refreshList = function (bForeceRefresh) {
                utils.loadKnowledgeTypeListQ(bForeceRefresh)
                    .then(function (response) {
                        $scope.dispList = [].concat($rootScope.arKnowledgeType);
                    }, function (response) {
                        // Error occurs!
                    });
            };

            $scope.refreshList(false);

            $scope.newItem = function () {
                $state.go('home.learn.knowledgetype.create');
            };

            $scope.displayItem = function (row) {
                var nID = 0;
                if (row) {
                    nID = row.id;
                } else {
                    for (var i = 0; i < $scope.dispList.length; i++) {
                        if ($scope.dispList[i].isSelected) {
                            nID = $scope.dispList[i].id;
                            break;
                        }
                    }
                }

                if (nID) {
                    $state.go("home.learn.knowledgetype.display", { id: nID });
                }
            }

            $scope.editItem = function (row) {
                var nID = 0;
                if (row) {
                    nID = row.id;
                } else {
                    for (var i = 0; i < $scope.dispList.length; i++) {
                        if ($scope.dispList[i].isSelected) {
                            nID = $scope.dispList[i].id;
                            break;
                        }
                    }
                }

                if (nID) {
                    $state.go("home.learn.knowledgetype.edit", { id: nID });
                }
            }

            $scope.removeItem = function (row) {
                var nID = 0;
                if (row) {
                    nID = row.id;
                } else {
                    for (var i = 0; i < $scope.dispList.length; i++) {
                        if ($scope.dispList[i].isSelected) {
                            nID = $scope.dispList[i].id;
                            break;
                        }
                    }
                }

                if (nID) {
                    utils.deleteKnowledgeTypeQ(nID)
                        .then(function (response) {
                            $scope.refreshList(true);
                        }, function (reason) {
                            // Add the error message
                            // Todo
                        });
                }
            }
        }])

	.controller('KnowledgeTypeController', ['$scope', '$rootScope', '$state', '$stateParams', '$http', '$log', 'utils',
        function ($scope, $rootScope, $state, $stateParams, $http, $log, utils) {

            $scope.Activity = "Common.Create"; // Default
            $scope.ActivityID = 1;
            $scope.CurrentObject = {};
            $scope.isReadonly = false;
            $scope.arParentTypes = angular.copy($rootScope.arKnowledgeType);

            // Reported message
            $scope.ReportedMessages = [];
            $scope.cleanReportMessages = function () {
                $scope.ReportedMessages = [];
            };

            // Selection control for Knowledge type
            $scope.parentConfig = {
                create: false,
                onChange: function (value) {
                    $log.info('KnowledgeController, Parent control, event onChange, ', value);
                },
                valueField: 'id',
                labelField: 'fullDisplayName',
                maxItems: 1,
                required: true
            };

            utils.loadKnowledgeTypeListQ(false)
                .then(function (response) {
                    if (angular.isDefined($stateParams.id)) {
                        if ($state.current.name === "home.learn.knowledgetype.edit") {
                            $scope.Activity = "Common.Edit";
                            $scope.ActivityID = 2;
                        } else if ($state.current.name === "home.learn.knowledgetype.display") {
                            $scope.Activity = "Common.Display";
                            $scope.isReadonly = true;
                            $scope.ActivityID = 3;
                        }

                        // Read the ID out
                        utils.loadKnowledgeTypeQ($stateParams.id)
                            .then(function (response) {
                                if (response instanceof hih.KnowledgeType) {
                                    $scope.CurrentObject = angular.copy(response);
                                }
                            }, function (reason) {
                            });
                    } else {
                        // Create a word
                        $scope.CurrentObject = new hih.KnowledgeType();
                    }
                }, function (response) {
                    // Error occurs!
                });


            $scope.submit = function () {
                var msgs = $scope.CurrentObject.verify();
                if ($.isArray(msgs) && msgs.length > 0) {
                    $.each(msgs, function (idx, obj) {
                        $scope.ReportedMessages.push(obj);
                    });
                    return;
                }

                if ($scope.ActivityID === 1) {
                    utils.createKnowledgeTypeQ($scope.CurrentObject)
                        .then(function (response) {
                            var wo = new hih.KnowledgeType();
                            wo.init(response);
                            $rootScope.arKnowledgeType.push(wo);

                            $scope.Activity = "Common.Display";
                            $scope.isReadonly = true;
                            $scope.ActivityID = 3;
                            $scope.CurrentObject = angular.copy(wo);
                        }, function (reason) {
                            // Todo
                        });
                } else if ($scope.ActivityID == 2) {
                    // Todo
                    utils.updateKnowledgeTypeQ($scope.CurrentObject)
                        .then(function (response) {
                            $scope.Activity = "Common.Display";
                            $scope.isReadonly = true;
                            $scope.ActivityID = 3;
                        }, function (reason) {
                            // Todo
                        });
                }
            }

            $scope.close = function () {
                $state.go("home.learn.knowledgetype.list");
            }
        }])

    .controller('KnowledgeListController', ['$scope', '$rootScope', '$state', '$log', '$q', 'utils',
        function ($scope, $rootScope, $state, $log, $q, utils) {

            $scope.dispList = [];

            $scope.refreshList = function (bForeceRefresh) {
                utils.loadKnowledgeListQ(bForeceRefresh)
                    .then(function (response) {
                        $scope.dispList = [].concat($rootScope.arKnowledge);
                    }, function (response) {
                        // Error occurs!
                    });
            };

            $scope.refreshList(false);

            $scope.newItem = function () {
                $state.go('home.learn.knowledge.create');
                return;

                var promise1 = utils.loadKnowledgeTypeListQ(false);
                $q.all([promise1])
                    .then(function (response) {
                        $state.go('home.learn.knowledge.create');
                    }, function (reason) {
                        // Todo.
                    });
            };

            // Display 
            $scope.displayItem = function (row) { 
                var nID = 0; 
                if (row) { 
                    nID = row.id;
                } else { 
                    for(var i = 0; i < $scope.dispList.length; i ++) { 
                        if ($scope.dispList[i].isSelected) { 
                            nID = $scope.dispList[i].id;
                            break; 
                        } 
                    } 
                }
                
                if (nID) {
                    $state.go("home.learn.knowledge.display", { id: nID });
                } else {
                    // Todo
                }
            }; 

            // Edit 
            $scope.editItem = function (row) { 
                var nID = 0; 
                if (row) { 
                    nID = row.id;
                } else { 
                    for(var i = 0; i < $scope.dispList.length; i ++) { 
                        if ($scope.dispList[i].isSelected) { 
                            nID = $scope.dispList[i].id;
                            break; 
                        } 
                    } 
                }

                if (nID) {
                    $state.go("home.learn.knowledge.edit", { id: nID });
                } else {
                    // Todo
                }
            }; 

            $scope.removeItem = function (row) {
                var strIDs = ""; 
                if (row) { 
                    strIDs = row.id.toString() 
                } else { 
                    for(var i = 0; i < $scope.dispList.length; i ++) { 
                        if ($scope.dispList[i].isSelected) { 
                            if (strIDs.length <= 0) {								 
                            } else { 
                                strIDs = strIDs.concat(hih.Constants.IDSplitChar);								 
                            } 

                            strIDs = strIDs.concat($scope.dispList[i].id.toString());
                        } 
                    } 
                }

                if (strIDs.length > 0) {
                    utils.deleteKnowledgeQ(strIDs)
                        .then(function (respone) {
                            // Delete the item successfully
                            $scope.refreshList(true);
                        }, function (reason) {
                            // Todo
                        });
                } else {
                    // Todo
                }
            }
        }])

    .controller('KnowledgeController', ['$scope', '$rootScope', '$state', '$stateParams', '$log', 'utils',
        function ($scope, $rootScope, $state, $stateParams, $log, utils) {

            $scope.Activity = "Common.Create"; // Default
            $scope.ActivityID = 1;
            $scope.CurrentObject = {};
            $scope.isReadonly = false;
            $scope.arTypes = [];

            // Reported message
            $scope.ReportedMessages = [];
            $scope.cleanReportMessages = function () {
                $scope.ReportedMessages = [];
            };

            // Selection control for Tags
            $scope.arTags = [];
            $scope.tags = [];
            $scope.tagsConfig = {
                create: true,
                onChange: function (value) {
                    $log.info('KnowledgeController, Tags control, event onChange, ', value);
                },
                maxItems: 10
            };

            // Selection control for Knowledge type
            $scope.typeConfig = {
                create: false,
                onChange: function (value) {
                    $log.info('KnowledgeController, Type control, event onChange, ', value);
                },
                valueField: 'id',
                labelField: 'fullDisplayName',
                maxItems: 1
            };

            $scope.tinymceOptions = {
                onChange: function (e) {
                    // put logic here for keypress and cut/paste changes
                    $log.info('KnowledgeController, Tinymce control, event onChange, ', value);
                },
                //inline: false,
                //plugins: 'advlist autolink link image lists charmap print preview',
                //skin: 'lightgray',
                //theme: 'modern'
                inline: false, 
                menubar: false, 
                statusbar: true, 
                toolbar: "fontselect fontsizeselect | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link forecolor backcolor | removeformat", 
                plugins : 'advlist autolink link image lists charmap print preview', 
                skin: 'lightgray', 
                theme : 'modern' 
            };

            utils.loadKnowledgeTypeListQ(false)
                .then(function (response) {
                    $scope.arTypes = [].concat($rootScope.arKnowledgeType);

                    if (angular.isDefined($stateParams.id)) {
                        if ($state.current.name === "home.learn.knowledge.edit") {
                            $scope.Activity = "Common.Edit";
                            $scope.ActivityID = 2;
                        } else if ($state.current.name === "home.learn.knowledge.display") {
                            $scope.Activity = "Common.Display";
                            $scope.isReadonly = true;
                            $scope.ActivityID = 3;
                        }

                        //var nID = parseInt($stateParams.id);
                        utils.loadKnowledgeQ($stateParams.id)
                            .then(function (response) {
                                if (response instanceof hih.Knowledge) {
                                    $scope.CurrentObject = angular.copy(response);

                                    $scope.tags = $scope.CurrentObject.tags.split(hih.Constants.IDSplitChar);
                                } else {
                                    $scope.ReportedMessages.push("Internal error occurred");
                                }
                            }, function (reason) {
                                $scope.ReportedMessages.push(reason);
                            });
                    } else {
                        // Create a knowlege
                        $scope.CurrentObject = new hih.Knowledge();
                    }
                }, function (reason) {
                    $scope.ReportedMessages.push(reason);
                });

            $scope.submit = function () {
                $scope.cleanReportMessages();

                $scope.CurrentObject.tags = $scope.tags.join(hih.Constants.IDSplitChar);

                var msgs = $scope.CurrentObject.verify();
                if ($.isArray(msgs) && msgs.length > 0) {
                    $.each(msgs, function (idx, obj) {
                        $scope.ReportedMessages.push(obj);
                    });
                    return;
                }

                if ($scope.ActivityID === 1) {
                    utils.createKnowledgeQ($scope.CurrentObject)
                        .then(function (response) {
                            // Navigate to the display mode
                            var wo = new hih.Knowledge();
                            wo.init(response.data);
                            $rootScope.arKnowledge.push(wo);

                            $scope.ActivityID = 3;
                            $scope.CurrentObject = angular.copy(wo);
                            $scope.isReadonly = true;
                            $scope.Activity = "Common.Display";
                        }, function (reason) {
                            // Todo
                        });
                } else if ($scope.ActivityID === 2) {
                    utils.updateKnowledgeQ($scope.CurrentObject)
                        .then(function (response) {
                            // Navigate to the display mode
                            $scope.ActivityID = 3;
                            $scope.isReadonly = true;
                            $scope.Activity = "Common.Display";
                            //$state.go("home.learn.knowledge.list");
                        }, function (reason) {
                        });
                }
            }

            $scope.close = function() {
                $state.go("home.learn.knowledge.list");
            }
        }])

	.controller('AboutController', ['$scope', '$rootScope', 'utils',
        function ($scope, $rootScope) {
        // Do nothing!
	    }])
    ;
})();