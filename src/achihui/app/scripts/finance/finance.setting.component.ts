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
    selector: 'hih-fin-setting',
    templateUrl: 'app/views/finance/finance.setting.html'
})

export class FinanceSettingComponent implements OnInit, OnDestroy {
    public finSettings: Array<HIHFinance.Setting>;
    private subFinSetting: Subscription;

    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        public dialogService: DialogService,
        private financeService: FinanceService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of FinanceSettingComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of FinanceSettingComponent");
        }

        if (!this.subFinSetting) {
            this.subFinSetting = this.financeService.settings$.subscribe(data => this.getSettings(data),
                error => this.handleError(error));

            this.financeService.loadSettings();   
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of FinanceSettingComponent");
        }

        if (this.subFinSetting) {
            this.subFinSetting.unsubscribe();
            this.subFinSetting = null;
        }
    }

    getSettings(data: Array<HIHFinance.Setting>) {
        if (DebugLogging) {
            console.log("Entering getSettings of FinanceSettingComponent");
        }

        this.zone.run(() => {
            this.finSettings = data;
        });
    }

    handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of FinanceSettingComponent");
        }
        console.log(error);

        if (error.status === 401) {
            this.dialogService.confirm("Unauthorized! It most likely you input an WRONG access code!");
        }
    }
}
