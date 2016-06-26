/* global $ */
/* global angular */
/* global hih */
(function() {
    "use strict";

    angular.module('achihapp.Utility', ['smart-table'])
		.directive('stringToFloat', function() {
		    return {
		        require: 'ngModel',
		        link: function(scope, element, attrs, ngModel) {
		            ngModel.$parsers.push(function(value) {
		                return '' + value;
		            });
		            ngModel.$formatters.push(function(value) {
		                return parseFloat(value);
		            });
		        }
		    };
		})

		.directive('csSelect', function () {
		    return {
		        require: '^stTable',
		        template: '<input type="checkbox"/>',
		        scope: {
		            row: '=csSelect'
		        },
		        link: function (scope, element, attr, ctrl) {
		            element.bind('change', function (evt) {
		                scope.$apply(function () {
		                    ctrl.select(scope.row, 'multiple');
		                });
		            });

		            scope.$watch('row.isSelected', function (newValue, oldValue) {
		                if (newValue === true) {
		                    element.parent().addClass('st-selected');
		                } else {
		                    element.parent().removeClass('st-selected');
		                }
		            });
		        }
		    };
		})

		.directive('cstSum', function () {
		    return {
		        restrict: 'E',
		        require: '^stTable',
		        template: '<div>{{ "Common.Sum" | translate }}: {{ sum_columnname }} </div>',
		        scope: {
		            columnname: '@columnname'
		        },
		        controller: function ($scope) {
		            $scope.sum_columnname = 0.0;
		        },
		        link: function (scope, element, attr, ctrl) {
		            scope.$watch(ctrl.getFilteredCollection, function (val) {
		                var nArr = (val || []);
		                scope.sum_columnname = 0;
		                for (var i = 0; i < nArr.length; i++) {
		                    scope.sum_columnname += parseFloat(nArr[i][scope.columnname]);
		                }
		                scope.sum_columnname = scope.sum_columnname.toFixed(2);
		            });
		        }
		    };
		})

		.directive('cstCount', function () {
		    return {
		        restrict: 'E',
		        require: '^stTable',
		        template: '<div>{{ "Common.Count" | translate }}: {{ cnt_columnname }} </div>',
		        scope: {
		        },
		        controller: function ($scope) {
		            $scope.cnt_columnname = 0;
		        },
		        link: function (scope, element, attr, ctrl) {
		            scope.$watch(ctrl.getFilteredCollection, function (val) {
		                var nArr = (val || []);
		                scope.cnt_columnname = nArr.length;
		            });
		        }
		    };
		})

		.directive('cstMax', function () {
		    return {
		        restrict: 'E',
		        require: '^stTable',
		        template: '<div>{{ "Common.Max" | translate }}: {{ max_columnname }} </div>',
		        scope: {
		            columnname: '@columnname'
		        },
		        controller: function ($scope) {
		            $scope.max_columnname = 0;
		        },
		        link: function (scope, element, attr, ctrl) {
		            scope.$watch(ctrl.getFilteredCollection, function (val) {
		                var nArr = (val || []);
		                for (var i = 0; i < nArr.length; i++) {
		                    if (i === 1) {
		                        scope.max_columnname = nArr[i][scope.columnname];
		                    }

		                    if (scope.sum_columnname < nArr[i][scope.columnname]) {
		                        scope.sum_columnname = nArr[i][scope.columnname]
		                    }
		                }
		            });
		        }
		    };
		})

		.factory(
			'utils', function($rootScope, $http, $q) {
			    var rtnObj = {};
						
			    rtnObj.findById = function (a, id) {
			        for (var i = 0; i < a.length; i++) {
			            if (a[i].id === id)
			                return a[i];
			        }
			        return null;
			    };

			    rtnObj.loadLanguagesQ = function (bForceReload) {
			        var deferred = $q.defer();
			        if ($rootScope.isLanguageListLoaded && !bForceReload) {
			            deferred.resolve(true);
			        } else {
			            $http.get(hih.Constants.APIBaseURL + hih.Constants.SubPathes.Language)
                            .then(function (response) {
                                $rootScope.arLanguage = [];
                                if ($.isArray(response.data) && response.data.length > 0) {
                                    $.each(response.data, function (idx, obj) {
                                        var applang = new hih.AppLanguage();
                                        applang.init(obj);
                                        $rootScope.arLanguage.push(applang);
                                    });
                                }
                                $rootScope.isLanguageListLoaded = false;
                                deferred.resolve(true);
                            }, function (response) {
                                var errormsg = "";
                                if (response.data && response.data.Message) {
                                    errormsg = response.data.Message;
                                } else {
                                    errormsg = "Error in loadLanguagesQ";
                                }

                                deferred.reject(errormsg);
                            });
			        }
			        return deferred.promise;
			    };

			    rtnObj.loadPOSQ = function (bForceReload) {
			        var deferred = $q.defer();
			        if ($rootScope.isPOSListLoaded && !bForceReload) {
			            deferred.resolve(true);
			        } else {
			            $http.get(hih.Constants.APIBaseURL + hih.Constants.SubPathes.POS)
                            .then(function (response) {
                                $rootScope.arPOS = [];
                                if ($.isArray(response.data) && response.data.length > 0) {
                                    $.each(response.data, function (idx, obj) {
                                        var enpos = new hih.EnPOS();
                                        enpos.init(obj);
                                        $rootScope.arPOS.push(enpos);
                                    });
                                }
                                $rootScope.isPOSListLoaded = false;
                                deferred.resolve(true);
                            }, function (response) {
                                var errormsg = "";
                                if (response.data && response.data.Message) {
                                    errormsg = response.data.Message;
                                } else {
                                    errormsg = "Error in loadPOSQ";
                                }

                                deferred.reject(errormsg);
                            });
			        }
			        return deferred.promise;
			    };

			    rtnObj.loadWordListQ = function (bForceReload) {
			        var deferred = $q.defer();
			        if ($rootScope.isWordListLoaded && !bForceReload) {
			            deferred.resolve(true);
			        } else {
			            var xhrheader = {};

			            if (angular.isDefined($rootScope.User) && $rootScope.User) {
			                xhrheader = {
			                    headers: {
			                        "Authorization": "Bearer " + $rootScope.User.access_token
			                    }
			                }
			            }

			            $http.get(hih.Constants.APIBaseURL + hih.Constants.SubPathes.Word, xhrheader)
                            .then(function (response) {
                                $rootScope.arWord = [];
                                if ($.isArray(response.data) && response.data.length > 0) {
                                    $.each(response.data, function (idx, obj) {
                                        var wo = new hih.EnWord();
                                        wo.init(obj);
                                        $rootScope.arWord.push(wo);
                                    });
                                }
                                $rootScope.isWordListLoaded = true;
                                deferred.resolve(true);
                            }, function (response) {
                                var errormsg = "";
                                if (response.data && response.data.Message) {
                                    errormsg = response.data.Message;
                                } else {
                                    errormsg = "Error in loadWordListQ";
                                }

                                deferred.reject(errormsg);
                            });
			        }
			        return deferred.promise;
			    };

			    rtnObj.loadWordQ = function (id) {
			        var deferred = $q.defer();
			        if ($rootScope.isWordListLoaded && !bForceReload) {
			            deferred.resolve(true);
			        } else {
			            var xhrheader = {};

			            if (angular.isDefined($rootScope.User) && $rootScope.User) {
			                xhrheader = {
			                    headers: {
			                        "Authorization": "Bearer " + $rootScope.User.access_token
			                    }
			                }
			            }

			            $http.get(hih.Constants.APIBaseURL + hih.Constants.SubPathes.Word + '/' + id, xhrheader)
                            .then(function (response) {
                                if ($rootScope.arWord && $.isArray($rootScope.arWord)) {
                                    $.each($rootScope.arWord, function (idx, obj) {
                                        if (parseInt(obj.WordID) === parseInt(id)) {
                                            // Todo!
                                        }
                                    });
                                } else {
                                    $rootScope.arWord = [];
                                    $rootScope.arWord.push($response.data);
                                }
                                deferred.resolve(true);
                            }, function (response) {
                                var errormsg = "";
                                if (response.data && response.data.Message) {
                                    errormsg = response.data.Message;
                                } else {
                                    errormsg = "Error in loadWordListQ";
                                }

                                deferred.reject(errormsg);
                            });
			        }
			        return deferred.promise;
			    };

			    rtnObj.createWordQ = function (wordObj) {
			        var deferred = $q.defer();
			        var xhrheader = {};

			        if (angular.isDefined($rootScope.User) && $rootScope.User) {
			            xhrheader = {
			                headers: {
			                    "Authorization": "Bearer " + $rootScope.User.access_token
			                }
			            }
			        }

			        $http.post(hih.Constants.APIBaseURL + hih.Constants.SubPathes.Word, wordObj.writeToJSONObjectString(), xhrheader)
                            .then(function (response) {
                                deferred.resolve(response.data);
                            }, function (response) {
                                deferred.reject(response.data.Message);
                            });
			        return deferred.promise;
			    };

			    rtnObj.loadSentenceListQ = function (bForceReload) {
			        var deferred = $q.defer();
			        if ($rootScope.isSentenceListLoaded && !bForceReload) {
			            deferred.resolve(true);
			        } else {
			            var xhrheader = {};

			            if (angular.isDefined($rootScope.User) && $rootScope.User) {
			                xhrheader = {
			                    headers: {
			                        "Authorization": "Bearer " + $rootScope.User.access_token
			                    }
			                }
			            }

			            $http.get(hih.Constants.APIBaseURL + hih.Constants.SubPathes.Sentence, xhrheader)
                            .then(function (response) {
                                $rootScope.arSentence = [];
                                if ($.isArray(response.data) && response.data.length > 0) {
                                    $.each(response.data, function (idx, obj) {
                                        var sent = new hih.EnSentence();
                                        sent.init(obj);
                                        $rootScope.arSentence.push(sent);
                                    });
                                }
                                $rootScope.isSentenceListLoaded = true;
                                deferred.resolve(true);
                            }, function (response) {
                                var errormsg = "";
                                if (response.data && response.data.Message) {
                                    errormsg = response.data.Message;
                                } else {
                                    errormsg = "Error in loadSentenceListQ";
                                }

                                deferred.reject(errormsg);
                            });
			        }
			        return deferred.promise;
			    };

			    return rtnObj;
			})
	;
})();
