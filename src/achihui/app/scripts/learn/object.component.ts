import {
    Component, OnInit, OnDestroy, NgZone
} from '@angular/core';
import { Router, ActivatedRoute }   from '@angular/router';
import { Observable }               from 'rxjs/Observable';
import { Subscription }             from 'rxjs/Subscription';
import '../rxjs-operators';
import { DebugLogging }             from '../app.setting';
import * as HIHLearn                from '../model/learn';
import { LearnService }             from '../services/learn.service';
import { DialogService }            from '../services/dialog.service';
import { AuthService }              from '../services/auth.service';

@Component({
    selector: 'hih-learn-object',
    template: `<div class="container"><router-outlet></router-outlet></div>`
})
export class ObjectComponent implements OnInit, OnDestroy {
    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        private dialogService: DialogService,
        private learnService: LearnService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of Learn.ObjectComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of Learn.ObjectComponent");
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of Learn.ObjectComponent");
        }
    }

    handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of Learn.ObjectComponent");
        }
        console.log(error);

        if (error.status === 401) {
            this.dialogService.confirm("Unauthorized! It most likely you input an WRONG access code!");
        }
    }
}
