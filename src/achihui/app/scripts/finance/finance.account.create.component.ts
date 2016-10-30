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
    selector: 'hih-fin-accountcreate',
    templateUrl: 'app/views/finance/finance.account.create.html'
})

export class FinanceAccountCreateComponent implements OnInit, OnDestroy {
    public finAccount: HIHFinance.Account;
    private subAccount: Subscription;

    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        public dialogService: DialogService,
        private financeService: FinanceService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of FinanceAccountCreateComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of FinanceAccountCreateComponent");
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of FinanceAccountCreateComponent");
        }
    }

    handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of FinanceAccountCreateComponent");
        }
        console.log(error);

        if (error.status === 401) {
            this.dialogService.confirm("Unauthorized! It most likely you input an WRONG access code!");
        }
    }
}
