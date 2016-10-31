﻿import {
    Component, OnInit, OnDestroy, NgZone
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import '../rxjs-operators';
import { DebugLogging } from '../app.setting';
import * as HIHFinance from '../model/finance';
import { FinanceService } from '../services/finance.service';
import { DialogService } from '../services/dialog.service';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'hih-fin-account-list',
    templateUrl: 'app/views/finance/account.list.html'
})
export class AccountListComponent implements OnInit, OnDestroy {
    public finAccounts: Array<HIHFinance.Account>;
    private subAccount: Subscription;

    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        public dialogService: DialogService,
        private financeService: FinanceService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of AccountListComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of AccountListComponent");
        }

        if (!this.subAccount) {
            this.subAccount = this.financeService.account$.subscribe(data => this.getAccountList(data),
                error => this.handleError(error));

            this.financeService.loadAccounts();
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of AccountListComponent");
        }

        if (this.subAccount) {
            this.subAccount.unsubscribe();
            this.subAccount = null;
        }
    }

    getAccountList(data: Array<HIHFinance.Account>) {
        if (DebugLogging) {
            console.log("Entering getAccountList of AccountListComponent");
        }

        this.zone.run(() => {
            this.finAccounts = data;
        });
    }

    handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of AccountListComponent");
        }
        console.log(error);

        if (error.status === 401) {
            this.dialogService.confirm("Unauthorized! It most likely you input an WRONG access code!");
        }
    }

    // Remove to the real data holder
    removeItem(row) {
        //var nAccntID = 0;
        //if (row) {
        //    nAccntID = row.ID;
        //} else {
        //    for (var i = 0; i < $scope.dispList.length; i++) {
        //        if ($scope.dispList[i].isSelected) {
        //            nAccntID = $scope.dispList[i].ID;
        //            break;
        //        }
        //    }
        //    if (0 === nAccntID) {
        //        $translate('Message.SelectSingleItemForDeletion')
        //            .then(
        //            function (response) {
        //                $rootScope.$broadcast("ShowMessageEx", "Error", [{ Type: 'danger', Message: response }]);
        //            },
        //            function (reason) {
        //                $rootScope.$broadcast("ShowMessageEx", "Error", [{ Type: 'danger', Message: "Fatal Error!" }]);
        //            }
        //            );
        //        return;
        //    }
        //}

        //$rootScope.$broadcast('ShowMessageEx', 'Delete Confirmation', [{ Type: 'warning', Message: 'Confirm on deleta the selected item?' }],
        //    function () {
        //        utils.deleteFinanceAccountQ(nAccntID)
        //            .then(function (response) {

        //                // Just refresh it!
        //                $scope.refreshList();
        //            }, function (reason) {
        //                $rootScope.$broadcast("ShowMessageEx", "Error", [{ Type: 'danger', Message: reason }]);
        //            });
        //    });
    }

    // Display
    displayItem(row) {
        //var nAccntID = 0;
        //if (row) {
        //    nAccntID = row.ID;
        //} else {
        //    for (var i = 0; i < $scope.dispList.length; i++) {
        //        if ($scope.dispList[i].isSelected) {
        //            nAccntID = $scope.dispList[i].ID;
        //            break;
        //        }
        //    }
        //}

        //$state.go("home.finance.account.display", { accountid: nAccntID });
    }

    // Edit
    editItem(row) {
        //var nAccntID = 0;
        //if (row) {
        //    nAccntID = row.ID;
        //} else {
        //    for (var i = 0; i < $scope.dispList.length; i++) {
        //        if ($scope.dispList[i].isSelected) {
        //            nAccntID = $scope.dispList[i].ID;
        //            break;
        //        }
        //    }
        //}

        //$state.go("home.finance.account.maintain", { accountid: nAccntID });
    }

    // Create
    newItem() {
        //$state.go('home.finance.account.create');
    }

    // Refresh the list
    refreshList() {
        //utils.loadFinanceAccountsQ(true)
        //    .then(function (response2) {
        //        // Do nothing!
        //    }, function (reason2) {
        //        // Error occurred
        //        $rootScope.$broadcast("ShowMessageEx", "Error", [{ Type: 'danger', Message: reason2 }]);
        //    });
    }
}
