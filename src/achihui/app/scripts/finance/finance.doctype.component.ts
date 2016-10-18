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
    selector: 'my-fin-setting',
    templateUrl: 'app/views/finance/finance.doctype.html'
})

export class FinanceDocTypeComponent implements OnInit, OnDestroy {
    public finDocType: Array<HIHFinance.DocumentType>;
    private subFinDocType: Subscription;

    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        public dialogService: DialogService,
        private financeService: FinanceService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of FinanceDocTypeComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of FinanceDocTypeComponent");
        }

        if (!this.subFinDocType) {
            this.subFinDocType = this.financeService.doctypes$.subscribe(data => this.getDocTypes(data),
                error => this.handleError(error));

            this.financeService.loadDocTypes();
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of FinanceDocTypeComponent");
        }

        if (this.subFinDocType) {
            this.subFinDocType.unsubscribe();
            this.subFinDocType = null;
        }
    }

    getDocTypes(data: Array<HIHFinance.DocumentType>) {
        if (DebugLogging) {
            console.log("Entering getCurrencies of FinanceDocTypeComponent");
        }

        this.zone.run(() => {
            this.finDocType = data;
        });
    }

    handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of FinanceDocTypeComponent");
        }
        console.log(error);

        if (error.status === 401) {
            this.dialogService.confirm("Unauthorized! It most likely you input an WRONG access code!");
        }
    }
}
