import {
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
    selector: 'hih-fin-accountlist',
    templateUrl: 'app/views/finance/finance.account.list.html'
})

export class FinanceAccountListComponent implements OnInit, OnDestroy {
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
            console.log("Entering constructor of FinanceAccountListComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of FinanceAccountListComponent");
        }

        if (!this.subAccount) {
            this.subAccount = this.financeService.account$.subscribe(data => this.getAccountList(data),
                error => this.handleError(error));

            this.financeService.loadAccounts();
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of FinanceAccountListComponent");
        }

        if (this.subAccount) {
            this.subAccount.unsubscribe();
            this.subAccount = null;
        }
    }

    getAccountList(data: Array<HIHFinance.Account>) {
        if (DebugLogging) {
            console.log("Entering getAccountList of FinanceAccountListComponent");
        }

        this.zone.run(() => {
            this.finAccounts = data;
        });
    }

    handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of FinanceAccountListComponent");
        }
        console.log(error);

        if (error.status === 401) {
            this.dialogService.confirm("Unauthorized! It most likely you input an WRONG access code!");
        }
    }
}
