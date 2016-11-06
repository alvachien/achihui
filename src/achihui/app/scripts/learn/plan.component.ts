import {
    Component, OnInit, OnDestroy, NgZone
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import '../rxjs-operators';
import { DebugLogging } from '../app.setting';
import * as HIHLearn from '../model/learn';
import { LearnService } from '../services/learn.service';
import { DialogService } from '../services/dialog.service';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'hih-learn-plan',
    template: `<div class="container"><router-outlet></router-outlet></div>`
})
export class PlanComponent implements OnInit, OnDestroy {
    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        private dialogService: DialogService,
        private learnService: LearnService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of Learn.PlanComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of Learn.PlanComponent");
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of Learn.PlanComponent");
        }
    }

    handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of Learn.PlanComponent");
        }
        console.log(error);

        if (error.status === 401) {
            this.dialogService.confirm("Unauthorized! It most likely you input an WRONG access code!");
        }
    }
}
