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
    selector: 'hih-fin-cclist',
    templateUrl: 'app/views/finance/finance.controllingcenter.list.html'
})

export class FinanceControllingCenterListComponent implements OnInit, OnDestroy {
    public finControllingCenters: Array<HIHFinance.ControllingCenter>;
    private subControlCenter: Subscription;

    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        public dialogService: DialogService,
        private financeService: FinanceService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of FinanceControllingCenterListComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of FinanceControllingCenterListComponent");
        }

        if (!this.subControlCenter) {
            this.subControlCenter = this.financeService.controllingcenter$.subscribe(data => this.getControllingCenterList(data),
                error => this.handleError(error));

            this.financeService.loadControllingCenters();
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of FinanceControllingCenterListComponent");
        }

        if (this.subControlCenter) {
            this.subControlCenter.unsubscribe();
            this.subControlCenter = null;
        }
    }

    getControllingCenterList(data: Array<HIHFinance.ControllingCenter>) {
        if (DebugLogging) {
            console.log("Entering getControllingCenterList of FinanceControllingCenterListComponent");
        }

        this.zone.run(() => {
            this.finControllingCenters = data;
        });
    }

    handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of FinanceControllingCenterListComponent");
        }
        console.log(error);

        if (error.status === 401) {
            this.dialogService.confirm("Unauthorized! It most likely you input an WRONG access code!");
        }
    }
}
