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
        IsConsoleLog : true
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
            return {};
        }
        Model.prototype.writeToJSONObjectString = function () {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering Model.writeToJSONObjectString method");
            }
            return "";
        }
        return Model;
    }());

    /* Language */
    hih.AppLanguage = (function (_super) {
        __extends(AppLanguage, _super);
        function AppLanguage() {
            this.LCID = -1;
            this.Name = "";
            this.NativeName = "";
        }
        AppLanguage.prototype.init = function (obj) {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering AppLanguage.init method.");
            }

            _super.prototype.init.call(this, obj);
            this.LCID = obj.LCID;
            this.Name = obj.Name;
            this.NativeName = obj.NativeName;
        }

        return AppLanguage;
    }(hih.Model));

    /* POS */
    hih.EnPOS = (function (_super) {
        __extends(EnPOS, _super);
        function EnPOS() {
            this.POSAbb = "";
            this.POSName = "";
            this.LangID = "";
            this.POSNativeName = "";
        }
        EnPOS.prototype.init = function (obj) {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering EnPOS.init method.");
            }

            _super.prototype.init.call(this, obj);
            this.POSAbb = obj.POSAbb;
            this.POSName = obj.POSName;
            this.LangID = obj.LangID;
            this.POSNativeName = obj.POSNativeName;
        }

        return EnPOS;
    }(hih.Model));

    /* Word Explain */
    hih.WordExplain = (function (_super) {
        __extends(WordExplain, _super);
        function WordExplain() {
            this.ExplainID = -1;
            this.POSAbb = "";
            this.LangID = "";
            this.ExplainString = "";

            this.RuntimeInfo = {};
        }
        WordExplain.prototype.init = function (obj) {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering WordExplain.init method.");
            }

            _super.prototype.init.call(this, obj);

            this.ExplainID = parseInt(obj.ExplainID);
            this.POSAbb = obj.POSAbb;
            this.LangID = parseInt(obj.LangID);
            this.ExplainString = obj.ExplainString;

            // Build up the runtime info.
        }
        WordExplain.prototype.verify = function () {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering WordExplain.verify method.");
            }

            var errMsg = _super.prototype.verify.call(this);

            this.POSAbb = this.POSAbb.trim();
            if (this.POSAbb.length <= 0) {
                errMsgs.push("POS is a must!");
            }
            this.LangID = this.LangID.trim();
            if (this.LangID.length <= 0) {
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
            this.WordID = -1;
            this.WordString = "";
            this.Tags = "";
            this.Explains = [];
            this.RuntimeInfo = {};
        }
        EnWord.prototype.init = function (obj) {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering EnWord.init method.");
            }

            this.WordID = obj.WordID;
            this.WordString = obj.WordString;
            this.Tags = obj.Tags;

            // Buildup the runtime info
            var that = this;
            if ($.isArray(obj.Explains) && obj.Explains.length > 0) {
                $.each(obj.Explains, function (idx, eo) {
                    var we = new hih.WordExplain();
                    we.init(eo);
                    that.Explains.push(we);
                });
            }
        }
        EnWord.prototype.verify = function () {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering EnWord.verify method.");
            }

            var errMsg = _super.prototype.verify.call(this);

            this.WordString = this.WordString.trim();
            if (this.WordString.length <= 0) {
                errMsg.push("String is a must!");
            }
            if (this.Explains.length <= 0) {
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
            this.ExplainID = -1;
            this.LangID = "";
            this.ExplainString = "";

            this.RuntimeInfo = {};
        }
        SentenceExplain.prototype.init = function (obj) {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering SentenceExplain.init method.");
            }

            _super.prototype.init.call(this, obj);

            this.ExplainID = parseInt(obj.ExplainID);
            this.LangID = parseInt(obj.LangID);
            this.ExplainString = obj.ExplainString;

            // Build up the runtime info.
        }
        SentenceExplain.prototype.verify = function () {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering SentenceExplain.verify method.");
            }

            var errMsg = _super.prototype.verify.call(this);

            this.LangID = this.LangID.trim();
            if (this.LangID.length <= 0) {
                errMsgs.push("Lange is a must!");
            }
            return errMsg;
        };

        return SentenceExplain;
    }(hih.Model));

    hih.EnSentence = (function (_super) {
        __extends(EnSentence, _super);
        function EnSentence() {
            this.SentenceID = -1;
            this.SentenceString = "";
            this.Tags = "";
            this.Explains = [];
            this.RuntimeInfo = {};
        }
        EnSentence.prototype.init = function (obj) {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering EnSentence.init method.");
            }

            this.WordID = obj.WordID;
            this.SentenceString = obj.SentenceString;
            this.Tags = obj.Tags;

            // Buildup the runtime info
            var that = this;
            if ($.isArray(obj.Explains) && obj.Explains.length > 0) {
                $.each(obj.Explains, function (idx, eo) {
                    var we = new hih.WordExplain();
                    we.init(eo);
                    that.Explains.push(we);
                });
            }
        }
        EnSentence.prototype.verify = function () {
            if (hih.Constants.IsConsoleLog) {
                console.log("Entering EnSentence.verify method.");
            }

            var errMsg = _super.prototype.verify.call(this);

            this.SentenceString = this.SentenceString.trim();
            if (this.SentenceString.length <= 0) {
                errMsg.push("String is a must!");
            }
            if (this.Explains.length <= 0) {
                errMsg.push("Explain is a must!");
            }
            return errMsg;
        }

        return EnSentence;
    }(hih.Model));

}());
