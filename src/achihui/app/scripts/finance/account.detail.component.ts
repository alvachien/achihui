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
    public finAccount: HIHFinance.Account = null;
    private subAccount: Subscription;
    public currMode: HIHCommon.UIMode = HIHCommon.UIMode.Create;

    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        public dialogService: DialogService,
        private financeService: FinanceService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of AccountCreateComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of AccountCreateComponent");
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of AccountCreateComponent");
        }
    }

    handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of AccountCreateComponent");
        }
        console.log(error);
    }
}
