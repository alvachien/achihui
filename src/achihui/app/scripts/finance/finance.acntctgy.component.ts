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
    selector: 'hih-fin-acntctgy',
    templateUrl: 'app/views/finance/finance.acntctgy.html'
})

export class FinanceAccountCategoryComponent implements OnInit, OnDestroy {
    public finAccountCategory: Array<HIHFinance.AccountCategory>;
    private subFinAcntCtgy: Subscription;

    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        public dialogService: DialogService,
        private financeService: FinanceService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of FinanceAccountCategoryComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of FinanceAccountCategoryComponent");
        }

        if (!this.subFinAcntCtgy) {
            this.subFinAcntCtgy = this.financeService.accountcategories$.subscribe(data => this.getAccountCategories(data),
                error => this.handleError(error));

            this.financeService.loadAccountCategories();
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of FinanceAccountCategoryComponent");
        }

        if (this.subFinAcntCtgy) {
            this.subFinAcntCtgy.unsubscribe();
            this.subFinAcntCtgy = null;
        }
    }

    getAccountCategories(data: Array<HIHFinance.AccountCategory>) {
        if (DebugLogging) {
            console.log("Entering getAccountCategories of FinanceAccountCategoryComponent");
        }

        this.zone.run(() => {
            this.finAccountCategory = data;
        });
    }

    handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of FinanceAccountCategoryComponent");
        }
        console.log(error);

        if (error.status === 401) {
            this.dialogService.confirm("Unauthorized! It most likely you input an WRONG access code!");
        }
    }
}
