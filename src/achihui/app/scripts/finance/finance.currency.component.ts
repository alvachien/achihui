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
    selector: 'hih-fin-curr',
    templateUrl: 'app/views/finance/finance.currency.html'
})

export class FinanceCurrencyComponent implements OnInit, OnDestroy {
    public finCurrency: Array<HIHFinance.Currency>;
    private subFinCurrency: Subscription;

    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        public dialogService: DialogService,
        private financeService: FinanceService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of FinanceCurrencyComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of FinanceCurrencyComponent");
        }

        if (!this.subFinCurrency) {
            this.subFinCurrency = this.financeService.currencies$.subscribe(data => this.getCurrencies(data),
                error => this.handleError(error));

            this.financeService.loadCurrencies();
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of FinanceCurrencyComponent");
        }

        if (this.subFinCurrency) {
            this.subFinCurrency.unsubscribe();
            this.subFinCurrency = null;
        }
    }

    getCurrencies(data: Array<HIHFinance.Currency>) {
        if (DebugLogging) {
            console.log("Entering getCurrencies of FinanceCurrencyComponent");
        }

        this.zone.run(() => {
            this.finCurrency = data;
        });
    }

    handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of FinanceCurrencyComponent");
        }
        console.log(error);

        if (error.status === 401) {
            this.dialogService.confirm("Unauthorized! It most likely you input an WRONG access code!");
        }
    }
}
