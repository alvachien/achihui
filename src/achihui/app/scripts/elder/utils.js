/* global $ */
/* global angular */
/* global hih */
(function() {
    "use strict";

    angular.module('achihapp.Utility', ['smart-table'])

		.factory(
			'utils', function($rootScope, $http, $q) {
			    var rtnObj = {};
						
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
                                $rootScope.isLanguageListLoaded = true;
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
                                $rootScope.isPOSListLoaded = true;
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

			    rtnObj.loadKnowledgeTypeListQ = function (bForceReload) {
			        var deferred = $q.defer();
			        if ($rootScope.isKnowledgeTypeListLoaded && !bForceReload) {
			            deferred.resolve(true);
			        } else {
			            $http.get(hih.Constants.APIBaseURL + hih.Constants.SubPathes.KnowledgeType)
                            .then(function (response) {
                                $rootScope.arKnowledgeType = [];
                                if ($.isArray(response.data) && response.data.length > 0) {
                                    $.each(response.data, function (idx, obj) {
                                        var wo = new hih.KnowledgeType();
                                        wo.init(obj);
                                        $rootScope.arKnowledgeType.push(wo);
                                    });
                                }
                                $rootScope.isKnowledgeTypeListLoaded = true;

                                // Build the parent relationship
                                var arNodes = [];
                                $.each($rootScope.arKnowledgeType, function (idx, obj) {
                                    if (obj.parentid === -1) {
                                        obj.RuntimeInfo.parentObject = null;
                                        obj.buildDisplayName();
                                        arNodes.push(obj);
                                    }
                                });

                                while (arNodes.length > 0) {
                                    var arcurnodes = [].concat(arNodes);
                                    arNodes = [];

                                    $.each(arcurnodes, function (idx, obj) {
                                        //obj.buildParentRelationship($rootScope.arKnowledgeType);
                                        //obj.buildDisplayName();

                                        $.each($rootScope.arKnowledgeType, function (idx2, obj2) {
                                            if (obj2.parentid === obj.id) {
                                                obj2.RuntimeInfo.parentObject = obj;
                                                obj2.buildDisplayName();
                                                arNodes.push(obj2);
                                            }
                                        });
                                    });
                                }

                                deferred.resolve(true);
                            }, function (response) {
                                var errormsg = "";
                                if (response.data && response.data.Message) {
                                    errormsg = response.data.Message;
                                } else {
                                    errormsg = "Error in loadKnowledgeTypeListQ";
                                }

                                deferred.reject(errormsg);
                            });
			        }
			        return deferred.promise;
			    };
			    rtnObj.createKnowledgeTypeQ = function (typeobj) {
			        var deferred = $q.defer();

			        $http.post(hih.Constants.APIBaseURL + hih.Constants.SubPathes.KnowledgeType, typeobj.writeToJSONObjectString())
                            .then(function (response) {
                                deferred.resolve(response.data);
                            }, function (reason) {
                                deferred.reject(reason.data.Message);
                            });
			        return deferred.promise;
			    };
			    rtnObj.updateKnowledgeTypeQ = function (typeobj) {
			        var deferred = $q.defer();

			        $http.put(hih.Constants.APIBaseURL + hih.Constants.SubPathes.KnowledgeType + "/" + typeobj.id.toString(),  typeobj.writeToJSONObjectString())
                        .then(function (response) {
                            deferred.resolve(response.data);
                        }, function (reason) {
                            deferred.reject(reason.data.Message);
                        });
			        return deferred.promise;
			    };
			    rtnObj.loadKnowledgeTypeQ = function (id) {
			        var deferred = $q.defer();
			        var ktobj = null;

			        if ($rootScope.arKnowledgeType && $.isArray($rootScope.arKnowledgeType) && $rootScope.arKnowledgeType.length > 0) {
			            $.each($rootScope.arKnowledgeType, function (idx, obj) {
			                if (parseInt(id) === obj.id) {
			                    ktobj = obj;
			                    return false;
			                }
			            });
			        } else {
			            $http.get(hih.Constants.APIBaseURL + hih.Constants.SubPathes.KnowledgeType + '/' + id)
                            .then(function (response) {
                                ktobj = new hih.KnowledgeType();
                                ktobj.init(response.data);

                                $rootScope.arKnowledgeType = [];
                                $rootScope.arKnowledgeType.push(ktobj);
                            }, function (reason) {
                                // Todo
                            });
			        }

			        if (ktobj && ktobj instanceof hih.KnowledgeType) {
			            deferred.resolve(ktobj);
			        } else {
                        deferred.reject("Failed!")
			        }
 
			        return deferred.promise;
			    }
			    rtnObj.deleteKnowledgeTypeQ = function (id) {
			        var deferred = $q.defer();
			        $http.delete(hih.Constants.APIBaseURL + hih.Constants.SubPathes.KnowledgeType + "/" + id)
                        .then(function (response) {
                            deferred.resolve(true);
                        }, function (reason) {
                            deferred.resolve(true);
                        });
			        return deferred.promise;
			    }

			    rtnObj.loadKnowledgeListQ = function (filterObj) {
			        var deferred = $q.defer();
			        var xhrheader = {};
			        var parm = [];
			        var parmStr = "";

			        if (angular.isDefined(filterObj.typeid) && filterObj.typeid) {
			            parm.push("typeid=" + filterObj.typeid.join(','));
			        }
			        if (angular.isDefined(filterObj.tags) && filterObj.tags) {
			            parm.push("tags=" + filterObj.tags.join(','));
			        }
			        if (angular.isDefined(filterObj.maxhit) && filterObj.maxhit) {
			            parm.push("maxhit=" + filterObj.maxhit.toString());
			        }
			        if (parm.length > 0) {
			            parmStr = "?";
			            $.each(parm, function (idx, obj) {
			                parmStr += "&" + obj;
			            });
			        }

			        $http.get(hih.Constants.APIBaseURL + hih.Constants.SubPathes.Knowledge + parmStr)
                        .then(function (response) {
                            var arKnowledge = [];
                            if ($.isArray(response.data) && response.data.length > 0) {
                                $.each(response.data, function (idx, obj) {
                                    var wo = new hih.Knowledge();
                                    wo.init(obj);
                                    arKnowledge.push(wo);
                                });
                            }
                            deferred.resolve(arKnowledge);
                        }, function (reason) {
                            var errormsg = "";
                            if (reason.data && reason.data.Message) {
                                errormsg = reason.data.Message;
                            } else {
                                errormsg = "Error in loadKnowledgeListQ";
                            }

                            deferred.reject(errormsg);
                        });
			        return deferred.promise;
			    };
			    //rtnObj.loadKnowledgeListQ = function (bForceReload) {
			    //    var deferred = $q.defer();
			    //    if ($rootScope.isKnowledgeListLoaded && !bForceReload) {
			    //        deferred.resolve(true);
			    //    } else {
			    //        var xhrheader = {};

			    //        $http.get(hih.Constants.APIBaseURL + hih.Constants.SubPathes.Knowledge)
                //            .then(function (response) {
                //                $rootScope.arKnowledge = [];
                //                if ($.isArray(response.data) && response.data.length > 0) {
                //                    $.each(response.data, function (idx, obj) {
                //                        var wo = new hih.Knowledge();
                //                        wo.init(obj);
                //                        $rootScope.arKnowledge.push(wo);
                //                    });
                //                }
                //                $rootScope.isKnowledgeListLoaded = true;
                //                deferred.resolve(true);
                //            }, function (response) {
                //                var errormsg = "";
                //                if (response.data && response.data.Message) {
                //                    errormsg = response.data.Message;
                //                } else {
                //                    errormsg = "Error in loadKnowledgeListQ";
                //                }

                //                deferred.reject(errormsg);
                //            });
			    //    }
			    //    return deferred.promise;
			    //};
			    rtnObj.loadKnowledgeQ = function (id) {
			        var deferred = $q.defer();

			        //var xhrheader = {};

			        //if (angular.isDefined($rootScope.User) && $rootScope.User) {
			        //    xhrheader = {
			        //        headers: {
			        //            "Authorization": "Bearer " + $rootScope.User.access_token
			        //        }
			        //    }
			        //}
			        $http.get(hih.Constants.APIBaseURL + hih.Constants.SubPathes.Knowledge + '/' + id)
                        .then(function (response) {
                            var wo = new hih.Knowledge();
                            wo.init(response.data);

                            if ($rootScope.arKnowledge && $.isArray($rootScope.arKnowledge)) {
                                var isExists = false;
                                $.each($rootScope.arKnowledge, function (idx, obj) {
                                    if (parseInt(obj.id) === parseInt(id)) {
                                        isExists = true;
                                        obj = wo;
                                    }
                                });

                                if (!isExists) {
                                    $rootScope.arKnowledge.push(wo);
                                }
                            } else {
                                $rootScope.arKnowledge = [];

                                $rootScope.arKnowledge.push(wo);
                            }
                            deferred.resolve(wo);
                        }, function (reason) {
                            var errormsg = "";
                            if (reason.data && reason.data.Message) {
                                errormsg = reason.data.Message;
                            } else {
                                errormsg = "Error in loadKnowledgeQ";
                            }

                            deferred.reject(errormsg);
                        });

			        return deferred.promise;
			    };
			    rtnObj.createKnowledgeQ = function (kobj) {
			        var deferred = $q.defer();
			        //var xhrheader = {};

			        //if (angular.isDefined($rootScope.User) && $rootScope.User) {
			        //    xhrheader = {
			        //        headers: {
			        //            "Authorization": "Bearer " + $rootScope.User.access_token
			        //        }
			        //    }
			        //}

			        $http.post(hih.Constants.APIBaseURL + hih.Constants.SubPathes.Knowledge, kobj.writeToJSONObjectString())
                            .then(function (response) {
                                deferred.resolve(response.data);
                            }, function (reason) {
                                deferred.reject(reason);
                            });

			        return deferred.promise;
			    };
			    rtnObj.updateKnowledgeQ = function (kobj) {
			        var deferred = $q.defer();
			        $http.put(hih.Constants.APIBaseURL + hih.Constants.SubPathes.Knowledge + "/" + kobj.id, kobj.writeToJSONObjectString())
                        .then(function (response) {
                            deferred.resolve(response.data);
                        }, function (reason) {
                            deferred.reject(reason);
                        });
			        return deferred.promise;
			    }
			    rtnObj.deleteKnowledgeQ = function (id) {
			        var deferred = $q.defer();
			        $http.delete(hih.Constants.APIBaseURL + hih.Constants.SubPathes.Knowledge + "/" + id)
                        .then(function (response) {
                            deferred.resolve(true);
                        }, function (reason) {
                            deferred.reject(reason);
                        });
			        return deferred.promise;
			    };

			    return rtnObj;
			})
	;
})();
