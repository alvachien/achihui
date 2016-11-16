import {
    Component, OnInit, OnDestroy, NgZone
} from '@angular/core';
import { Router, ActivatedRoute }   from '@angular/router';
import { Observable }               from 'rxjs/Observable';
import { Subscription }             from 'rxjs/Subscription';
import '../rxjs-operators';
import { DebugLogging }             from '../app.setting';
import * as HIHLearn                from '../model/learn';
import { LearnService }             from '../services/learn.service';
import { DialogService }            from '../services/dialog.service';
import { AuthService }              from '../services/auth.service';

@Component({
    selector: 'hih-learn-object-list',
    templateUrl: 'app/views/learn/object.list.html'
})
export class ObjectListComponent implements OnInit, OnDestroy {
    public lrnObjects: Array<HIHLearn.LearnObject> = [];
    private subObject: Subscription;

    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        private dialogService: DialogService,
        private learnService: LearnService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of Learn.ObjectListComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of Learn.ObjectListComponent");
        }

        if (!this.subObject) {
            this.subObject = this.learnService.object$.subscribe(data => this.getObjectList(data),
                error => this.handleError(error));

            this.learnService.loadObjects();
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of Learn.ObjectListComponent");
        }

        if (this.subObject) {
            this.subObject.unsubscribe();
            this.subObject = null;
        }
    }

    getObjectList(data: Array<HIHLearn.LearnObject>) {
        if (DebugLogging) {
            console.log("Entering getObjectList of Learn.ObjectListComponent");
        }

        this.zone.run(() => {
            this.lrnObjects = data;
        });
    }

    handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of Learn.ObjectListComponent");
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
        this.router.navigate(['/learn/object/display', +row.Id]);
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
        this.router.navigate(['/learn/object/change', +row.Id]);
    }

    // Create
    newItem() {
        // Navigate to the create page
        this.router.navigate(['/learn/object/create']);
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
