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
    selector: 'hih-fin-trantypelist',
    templateUrl: 'app/views/finance/finance.trantype.list.html'
})

export class FinanceTranTypeListComponent implements OnInit, OnDestroy {
    public finTranType: Array<HIHFinance.TranType>;
    private subFinTranType: Subscription;

    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        public dialogService: DialogService,
        private financeService: FinanceService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of FinanceTranTypeListComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of FinanceTranTypeListComponent");
        }

        if (!this.subFinTranType) {
            this.subFinTranType = this.financeService.trantypes$.subscribe(data => this.getTranTypeList(data),
                error => this.handleError(error));

            this.financeService.loadTranTypes();
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of FinanceTranTypeListComponent");
        }

        if (this.subFinTranType) {
            this.subFinTranType.unsubscribe();
            this.subFinTranType = null;
        }
    }

    getTranTypeList(data: Array<HIHFinance.TranType>) {
        if (DebugLogging) {
            console.log("Entering getTranTypeList of FinanceTranTypeListComponent");
        }

        this.zone.run(() => {
            this.finTranType = data;
        });
    }

    handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of FinanceTranTypeListComponent");
        }
        console.log(error);

        if (error.status === 401) {
            this.dialogService.confirm("Unauthorized! It most likely you input an WRONG access code!");
        }
    }
}
