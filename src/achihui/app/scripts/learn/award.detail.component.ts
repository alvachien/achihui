import {
    Component, OnInit, OnDestroy, NgZone
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import '../rxjs-operators';
import { DebugLogging } from '../app.setting';
import * as HIHLearn from '../model/learn';
import { FinanceService } from '../services/finance.service';
import { DialogService } from '../services/dialog.service';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'hih-learn-award-detail',
    templateUrl: 'app/views/learn/award.detail.html'
})
export class AwardDetailComponent implements OnInit, OnDestroy {
    public lrnAward: HIHLearn.LearnAward = null;
    private subObject: Subscription = null;

    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        public dialogService: DialogService,
        private financeService: FinanceService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of AwardDetailComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of AwardDetailComponent");
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of AwardDetailComponent");
        }
    }

    handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of AwardDetailComponent");
        }
        console.log(error);

        if (error.status === 401) {
            this.dialogService.confirm("Unauthorized! It most likely you input an WRONG access code!");
        }
    }
}
