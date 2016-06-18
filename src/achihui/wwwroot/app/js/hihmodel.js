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

    /* Root Model */
    hih.Model = (function () {
        function Model() {
            this.CreatedAt = new Date();
            this.CreatedBy = {};

            this.Version = "1.2";
        }
        Model.prototype.Init = function (obj) {
            console.log("Entering Init method.");
        }
        Model.prototype.Verify = function () {
            console.log("Entering Verify method..");
            return [];
        }
        Model.prototype.WriteToJSONObject = function () {
            console.log("Entering WriteToJSONObject method ");
            return {};
        }
        Model.prototype.WriteToJSONObjectString = function () {
            console.log("Entering WriteToJSONObjectString method");
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
        AppLanguage.prototype.Init = function (obj) {
            _super.prototype.Init.call(this, obj);
            this.LCID = obj.LCID;
            this.Name = obj.Name;
            this.NativeName = obj.NativeName;
        }
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
        EnPOS.prototype.Init = function (obj) {
            _super.prototype.Init.call(this, obj);
            this.POSAbb = obj.POSAbb;
            this.POSName = obj.POSName;
            this.LangID = obj.LangID;
            this.POSNativeName = obj.POSNativeName;
        }
    }(hih.Model));
    /* Word Explain */
    hih.WordExplain = (function (_super) {
        __extends(WordExplain, _super);
        function WordExplain() {
            this.ExplainID = 0;
            this.POSAbb = "";
            this.LangID = "";
            this.ExplainString = "";

            this.RuntimeInfo = {};
        }
        WordExplain.prototype.Verify = function () {
            var errMsg = _super.prototype.Verify.call(this);

            this.POSAbb = this.POSAbb.trim();
            if (this.POSAbb.length <= 0) {
                errMsgs.push("POS is a must!");
            }
            return errMsg;
        };
        return WordExplain;
    }(hih.Model));
    /* Word */
    hih.EnWord = (function (_super) {
        __extends(EnWord, _super);
        function EnWord() {

        }
    }(hih.Model));
}());
