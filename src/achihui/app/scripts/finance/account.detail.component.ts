import {
    Component, OnInit, OnDestroy, NgZone
} from '@angular/core';
import { Router, ActivatedRoute }   from '@angular/router';
import { Observable }               from 'rxjs/Observable';
import { Subscription }             from 'rxjs/Subscription';
import '../rxjs-operators';
import { DebugLogging }             from '../app.setting';
import * as HIHCommon               from '../model/common';
import * as HIHFinance              from '../model/finance';
import { FinanceService }           from '../services/finance.service';
import { DialogService }            from '../services/dialog.service';
import { AuthService }              from '../services/auth.service';

@Component({
    selector: 'hih-fin-account-detail',
    templateUrl: 'app/views/finance/account.detail.html'
})
export class AccountDetailComponent implements OnInit, OnDestroy {
    public AccountObject: HIHFinance.Account = null;
    private subAccount: Subscription;
    public currMode: HIHCommon.UIMode = HIHCommon.UIMode.Create;
    public Activity:string = "";
    public ActivityID: HIHCommon.UIMode = HIHCommon.UIMode.Create;
    public ShowDownpaymentInfo: boolean = false;
    public DPAccountInfo: HIHFinance.AccountExtraDownpayment = null;
    public DPTmpDoc = [];
    public SafeDPTmpDoc = [];
    public ReportedMessages = [];

    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        public dialogService: DialogService,
        private financeService: FinanceService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of AccountDetailComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of AccountDetailComponent");
        }

        this.Activity = "Common.Create";
        this.AccountObject = new HIHFinance.Account();

        //this.route.params
        //this.router.routerState
    //if(angular.isDefined($stateParams.accountid)) {
    //    if ($state.current.name === "home.finance.account.maintain") {
    //        $scope.Activity = "Common.Edit";
    //        $scope.ActivityID = hih.Constants.UIMode_Change;
    //    } else if ($state.current.name === "home.finance.account.display") {
    //        $scope.Activity = "Common.Display";
    //        $scope.ActivityID = hih.Constants.UIMode_Display;
    //    }

    //    var nAcntID = parseInt($stateParams.accountid);
    //    $.each($rootScope.arFinanceAccount, function (idx, obj) {
    //        if (obj.ID === nAcntID) {
    //            $scope.AccountObject = angular.copy(obj);

    //            if ($scope.AccountObject && $scope.AccountObject.CategoryObject
    //                && ($scope.AccountObject.CategoryObject.AssetFlag === hih.Constants.AccountCategoryAssetFlag_DownpayOut
    //                    || $scope.AccountObject.CategoryObject.AssetFlag === hih.Constants.AccountCategoryAssetFlag_DownpayIn)) {
    //                // Read the info out
    //                utils.loadFinanceAccountDPInfoQ(nAcntID)
    //                    .then(function (response) {
    //                        $scope.ShowDownpaymentInfo = true;

    //                        // Downpayment info
    //                        $scope.DPAccountInfo = response[0];
    //                        if ($.isArray(response[1]) && response[1].length > 0) {
    //                            $.each(response[1], function (idx3, obj3) {
    //                                $scope.DPTmpDoc.push(obj3);
    //                            })
    //                        }
    //                    }, function (reason) {
    //                        $rootScope.$broadcast("ShowMessageEx", "Error", [{ Type: 'danger', Message: reason }]);
    //                    })
    //            }
    //            return false;
    //        }
    //    });
    //} else {
    //$scope.Activity = "Common.Create";
    //$scope.ActivityID = hih.Constants.UIMode_Create;
        //}
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of AccountDetailComponent");
        }
    }

    handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of AccountDetailComponent");
        }
        console.log(error);
    }

    cleanReportMessages() {
        this.ReportedMessages = [];
    };

    goDPDoc(row) {
        if (DebugLogging) {
            console.log("Entering goDPDoc of AccountDetailComponent");
        }
        //$state.go('home.finance.document.dptmpdoc_post', { docid: row.DocID });
    };

    onSubmit() {
        if (DebugLogging) {
            console.log("Entering onSubmit of AccountDetailComponent");
        }
        this.cleanReportMessages();

        //// String => Integer
        //$scope.AccountObject.CategoryID = parseInt($scope.AccountObject.CategoryID);

        //var errMsgs = $scope.AccountObject.Verify($translate);
        //if (errMsgs && errMsgs.length > 0) {
        //    $q.all(errMsgs).then(function (translations) {
        //        Array.prototype.push.call($scope.ReportedMessages, translations);
        //    }, function (reason) {
        //        $rootScope.$broadcast("ShowMessageEx", "Error", [{ Type: 'danger', Message: reason }]);
        //    });
        //    return;
        //}

        //// Now submit to the server side
        //var strJSON = JSON && JSON.stringify($scope.AccountObject);
        //if (strJSON) {
        //    if (this.ActivityID === hih.Constants.UIMode_Create) {
        //        utils.createFinanceAccountQ(strJSON)
        //            .then(function (response) {
        //                // First of all, update the rootScope
        //                if (response) {
        //                    $state.go("home.finance.account.display", { accountid: response });
        //                } else {
        //                    $state.go("home.finance.account.list");
        //                }
        //            }, function (reason) {
        //                // Failed, throw out error message
        //                $rootScope.$broadcast("ShowMessageEx", "Error", [{ Type: 'danger', Message: reason }]);
        //            });
        //    } else if (this.ActivityID === hih.Constants.UIMode_Change) {
        //        utils.changeFinanceAccountQ($scope.AccountObject)
        //            .then(function (response) {
        //                // First of all, update the rootScope
        //                if (response) {
        //                    $state.go("home.finance.account.display", { accountid: $scope.AccountObject.ID });
        //                } else {
        //                    $state.go("home.finance.account.list");
        //                }
        //            }, function (reason) {
        //                // Failed, throw out error message
        //                $rootScope.$broadcast("ShowMessageEx", "Error", [{ Type: 'danger', Message: reason }]);
        //            });
        //    }
        //} else {
        //    $rootScope.$broadcast("ShowMessageEx", "Error", [{ Type: 'danger', Message: "To-Do: Reason" }]);
        //}
    }

    onClose() {
        if (DebugLogging) {
            console.log("Entering onClose of AccountDetailComponent");
        }

        this.router.navigate(['/finance/account/list']);
    }
}
