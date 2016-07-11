/* global $ */
/* global angular */
(function() {
    "use strict";
    
    var hih = (window && window.hih) || (window.hih = {});

    var __extends = (this && this.__extends) || function (d, b) {
        for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };

    hih.Constants = {
        IsConsoleLog: true,
        // Debug
        APIBaseURL: "http://localhost:25688/api/",
        //IdSrvURL: "http://localhost:41016/",
        //IdSrvLoginRedirURL: "http://localhost:29521/logincallback.html",
        //IdSrvLogoutRedirURL: "http://localhost:29521/logoutcallback.html",

        // Release
        //APIBaseURL: "http://achihapi.azurewebsites.net/api/",
        IdSrvURL: "http://acidserver.azurewebsites.net/",
        IdSrvLoginRedirURL: "http://achihui.azurewebsites.net/logincallback.html",
        IdSrvLogoutRedirURL: "http://achihui.azurewebsites.net/logoutcallback.html",

        SubPathes: {
            Word: 'word',
            Sentence: 'sentence',
            POS: 'pos',
            Language: 'language',
            Todo: 'todo',
            KnowledgeType: 'knowledgetype',
            Knowledge: 'knowledge'
        },

        TypeParentSplitter: " > ",
        IDSplitChar: ","
    };

    /* Root Model */
    hih.Model = (function () {
        function Model() {
            this.CreatedAt = new Date();
            this.CreatedBy = {};
        }
        Model.prototype.init = function (obj) {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering Model.init method.");
            }
        }
        Model.prototype.verify = function () {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering Model.verify method..");
            }
            return [];
        }
        Model.prototype.writeToJSONObject = function () {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering Model.writeToJSONObject method ");
            }
            return {
                CreatedAt: this.CreatedAt,
                CreatedBy: this.CreatedBy
            };
        }
        Model.prototype.writeToJSONObjectString = function () {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering Model.writeToJSONObjectString method");
            }

            var forJSON = this.writeToJSONObject();
            if (forJSON) {
                return JSON && JSON.stringify(forJSON);
            }
            return JSON && JSON.stringify(this);            
        }
        return Model;
    }());

    /* Language */
    hih.AppLanguage = (function (_super) {
        __extends(AppLanguage, _super);
        function AppLanguage() {
            this.lcid = 0;
            this.isoName = "";
            this.englishName = "";
            this.nativeName = "";
        }
        AppLanguage.prototype.init = function (obj) {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering AppLanguage.init method.");
            }

            _super.prototype.init.call(this, obj);
            this.lcid = obj.lcid;
            this.isoName = obj.isoName;
            this.englishName = obj.englishName;
            this.nativeName = obj.nativeName;
        }

        return AppLanguage;
    }(hih.Model));

    /* POS */
    hih.EnPOS = (function (_super) {
        __extends(EnPOS, _super);
        function EnPOS() {
            this.posAbb = "";
            this.posName = "";
            this.langID = "";
            this.posNativeName = "";
        }
        EnPOS.prototype.init = function (obj) {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering EnPOS.init method.");
            }

            _super.prototype.init.call(this, obj);
            this.posAbb = obj.posAbb;
            this.posName = obj.posName;
            this.langID = obj.langID;
            this.posNativeName = obj.posNativeName;
        }

        return EnPOS;
    }(hih.Model));

    /* Word Explain */
    hih.WordExplain = (function (_super) {
        __extends(WordExplain, _super);
        function WordExplain() {
            this.explainID = 0;
            this.posAbb = "";
            this.langID = "";
            this.explainString = "";

            this.RuntimeInfo = {};
        }
        WordExplain.prototype.init = function (obj) {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering WordExplain.init method.");
            }

            _super.prototype.init.call(this, obj);

            this.explainID = parseInt(obj.explainID);
            this.posAbb = obj.posAbb;
            this.langID = obj.langID;
            this.explainString = obj.explainString;

            // Build up the runtime info.
            this.RuntimeInfo.DisplayExplain = this.posAbb + ": [" + this.langID + "] " + this.explainID;
        }
        WordExplain.prototype.writeToJSONObject = function () {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering WordExplain.writeToJSONObject method.");
            }

            var jsonObj = _super.prototype.writeToJSONObject.call(this);
            jsonObj.explainID = this.explainID;
            jsonObj.posAbb = this.posAbb;
            jsonObj.langID = this.langID;
            jsonObj.explainString = this.explainString;

            return jsonObj;
        }
        WordExplain.prototype.verify = function () {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering WordExplain.verify method.");
            }

            var errMsg = _super.prototype.verify.call(this);

            this.posAbb = this.posAbb.trim();
            if (this.posAbb.length <= 0) {
                errMsgs.push("POS is a must!");
            }
            this.langID = this.langID.trim();
            if (this.langID.length <= 0) {
                errMsgs.push("Lange is a must!");
            }
            return errMsg;
        };        

        return WordExplain;
    }(hih.Model));

    /* Word */
    hih.EnWord = (function (_super) {
        __extends(EnWord, _super);
        function EnWord() {
            this.wordID = 0;
            this.wordString = "";
            this.tags = "";
            this.explains = [];

            this.RuntimeInfo = {};
        }
        EnWord.prototype.init = function (obj) {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering EnWord.init method.");
            }

            this.wordID = obj.wordID;
            this.wordString = obj.wordString;
            this.tags = obj.tags;

            // Buildup the runtime info
            var that = this;
            if ($.isArray(obj.explains) && obj.explains.length > 0) {
                $.each(obj.explains, function (idx, eo) {
                    var we = new hih.WordExplain();
                    we.init(eo);

                    that.explains.push(we);
                    that.RuntimeInfo.DisplayExplain = that.RuntimeInfo.DisplayExplain + we.RuntimeInfo.DisplayExplain;
                });
            }
        }
        EnWord.prototype.writeToJSONObject = function () {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering EnWord.writeToJSONObject method.");
            }

            var jsonObj = _super.prototype.writeToJSONObject.call(this);
            jsonObj.wordID = this.wordID;
            jsonObj.wordString = this.wordString;
            jsonObj.tags = this.tags.toString();
            jsonObj.explains = [];

            $.each(this.explains, function (idx, obj) {
                var subobj = obj.writeToJSONObject();
                jsonObj.explains.push(subobj);
            });
            return jsonObj;
        }
        EnWord.prototype.verify = function () {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering EnWord.verify method.");
            }

            var errMsg = _super.prototype.verify.call(this);

            this.wordString = this.wordString.trim();
            if (this.wordString.length <= 0) {
                errMsg.push("String is a must!");
            }
            if (this.explains.length <= 0) {
                errMsg.push("Explain is a must!");
            }
            return errMsg;
        }

        return EnWord;
    }(hih.Model));

    /* Sentence */
    hih.SentenceExplain = (function (_super) {
        __extends(SentenceExplain, _super);
        function SentenceExplain() {
            this.explainID = -1;
            this.langID = "";
            this.explainString = "";

            this.RuntimeInfo = {};
        }
        SentenceExplain.prototype.init = function (obj) {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering SentenceExplain.init method.");
            }

            _super.prototype.init.call(this, obj);

            this.explainID = parseInt(obj.explainID);
            this.langID = parseInt(obj.langID);
            this.explainString = obj.explainString;

            // Build up the runtime info.
        }
        SentenceExplain.prototype.verify = function () {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering SentenceExplain.verify method.");
            }

            var errMsg = _super.prototype.verify.call(this);

            this.langID = this.langID.trim();
            if (this.langID.length <= 0) {
                errMsgs.push("Lange is a must!");
            }
            return errMsg;
        };

        return SentenceExplain;
    }(hih.Model));

    hih.EnSentence = (function (_super) {
        __extends(EnSentence, _super);
        function EnSentence() {
            this.sentenceID = 0;
            this.sentenceString = "";
            this.tags = "";
            this.explains = [];

            this.RuntimeInfo = {};
        }
        EnSentence.prototype.init = function (obj) {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering EnSentence.init method.");
            }

            this.wordID = obj.wordID;
            this.sentenceString = obj.sentenceString;
            this.tags = obj.tags;

            // Buildup the runtime info
            var that = this;
            if ($.isArray(obj.explains) && obj.explains.length > 0) {
                $.each(obj.explains, function (idx, eo) {
                    var we = new hih.WordExplain();
                    we.init(eo);
                    that.explains.push(we);
                });
            }
        }
        EnSentence.prototype.verify = function () {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering EnSentence.verify method.");
            }

            var errMsg = _super.prototype.verify.call(this);

            this.sentenceString = this.sentenceString.trim();
            if (this.sentenceString.length <= 0) {
                errMsg.push("String is a must!");
            }
            if (this.explains.length <= 0) {
                errMsg.push("Explain is a must!");
            }
            return errMsg;
        }

        return EnSentence;
    }(hih.Model));

    /* Knowledge type */
    hih.KnowledgeType = (function (_super) {
        __extends(KnowledgeType, _super);
        function KnowledgeType() {
            this.id = -1;
            this.parentid = -1;
            this.name = "";
            this.comment = "";

            this.RuntimeInfo = {};
            // To UI binding purpose, also a kind of runtime
            this.fullDisplayName = "";
        }
        KnowledgeType.prototype.init = function (obj) {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering KnowledgeType.init method.");
            }

            this.id = parseInt(obj.id);
            if (obj.parentID)
                this.parentid = parseInt(obj.parentID);
            else
                this.parentid = -1;
            this.name = obj.name;
            this.comment = obj.comment;

            // Buildup the runtime info
            //var that = this;
            //if ($.isArray(obj.explains) && obj.explains.length > 0) {
            //    $.each(obj.explains, function (idx, eo) {
            //        var we = new hih.WordExplain();
            //        we.init(eo);
            //        that.explains.push(we);
            //    });
            //}
        }
        KnowledgeType.prototype.buildParentRelationship = function (arTypes) {
            if (this.parentid === -1) {
                this.RuntimeInfo.parentObject = null;
            } else {
                if ($.isArray(arTypes) && arTypes.length > 0) {
                    var that = this;

                    $.each(arTypes, function (idx, obj) {
                        if (that.parentid === obj.id) {
                            that.RuntimeInfo.parentObject = obj;
                            return false;
                        }
                    });
                }
            }
        }
        KnowledgeType.prototype.buildDisplayName = function () {
            if (this.RuntimeInfo.parentObject) {
                this.fullDisplayName = this.RuntimeInfo.parentObject.fullDisplayName + hih.Constants.TypeParentSplitter + this.name;
            } else {
                this.fullDisplayName = this.name;
            }
        }
        KnowledgeType.prototype.verify = function () {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering KnowledgeType.verify method.");
            }

            var errMsg = _super.prototype.verify.call(this);

            this.name = this.name.trim();
            if (this.name.length <= 0) {
                errMsg.push("Name is a must!");
            }

            return errMsg;
        }
        KnowledgeType.prototype.writeToJSONObject = function () {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering KnowledgeType.writeToJSONObject method.");
            }

            var jsonObj = _super.prototype.writeToJSONObject.call(this);
            jsonObj.id = this.id;
            if (this.parentid === -1)
                jsonObj.parentid = null;
            else
                jsonObj.parentid = this.parentid;
            jsonObj.name = this.name.trim();
            jsonObj.comment = this.comment.trim();

            return jsonObj;
        }

        return KnowledgeType;
    }(hih.Model));

    /* Knowledge */
    hih.Knowledge = (function (_super) {
        __extends(Knowledge, _super);
        function Knowledge() {
            this.id = 0;
            this.typeid = 0;
            this.title = "";
            this.content = "";
            this.tags = "";
            this.createdAt = new Date();
            this.modifiedAt = new Date();

            this.RuntimeInfo = {};
        }
        Knowledge.prototype.init = function (obj) {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering Knowledge.init method.");
            }

            this.id = obj.id;
            this.typeid = obj.typeID;
            this.title = obj.title;
            this.content = obj.content;
            this.tags = obj.tags;
            this.createdAt = obj.createdAt;
            this.modifiedAt = obj.modifiedAt;

            var regex = /(<([^>]+)>)/ig;
            this.RuntimeInfo.shortcontent = this.content.replace(regex, "").substring(0, 50);

            // Buildup the runtime info
            //var that = this;
            //if ($.isArray(obj.explains) && obj.explains.length > 0) {
            //    $.each(obj.explains, function (idx, eo) {
            //        var we = new hih.WordExplain();
            //        we.init(eo);
            //        that.explains.push(we);
            //    });
            //}
        }
        Knowledge.prototype.verify = function () {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering Knowledge.verify method.");
            }

            var errMsg = _super.prototype.verify.call(this);

            this.title = this.title.trim();
            if (this.title.length <= 0) {
                errMsg.push("Title is a must!");
            }
            if (this.content.length <= 0) {
                errMsg.push("Content is a must!");
            }

            return errMsg;
        }
        Knowledge.prototype.writeToJSONObject = function () {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering Knowledge.writeToJSONObject method.");
            }

            var jsonObj = _super.prototype.writeToJSONObject.call(this);
            jsonObj.id = this.id;
            jsonObj.typeid = this.typeid;
            jsonObj.tags = this.tags.toString();
            jsonObj.title = this.title;
            jsonObj.content = this.content;
            // For createdAt and modifiedAt, it will be updated via the API internally

            return jsonObj;
        }

        return Knowledge;
    }(hih.Model));

}());
