import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { DebugLogging } from '../app.setting';
import * as HIHUser from '../model/user';
import { DialogService } from '../services/dialog.service';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
    selector: 'hih-home-userhist',
    templateUrl: 'app/views/home/userhistory.html'
})

export class UserHistoryComponent implements OnInit, OnDestroy {
    public userHist: Array<HIHUser.UserHistory>;
    private subUserHistory: Subscription;

    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        public dialogService: DialogService,
        private userService: UserService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of UserHistoryComponent");
        }

        if (!this.subUserHistory) {
            this.subUserHistory = this.userService.userHistories$.subscribe(data => this.getUserHistories(data),
                error => this.handleError(error));

            this.userService.loadUserHistories();
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of UserHistoryComponent");
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of UserHistoryComponent");
        }
    }

    getUserHistories(data: Array<HIHUser.UserHistory>) {
        if (DebugLogging) {
            console.log("Entering getUserHistories of UserHistoryComponent");
        }

        this.zone.run(() => {
            this.userHist = data;
        });
    }

    handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of UserHistoryComponent");
        }
        console.log(error);

        if (error.status === 401) {
            this.dialogService.confirm("Unauthorized! It most likely you input an WRONG access code!");
        }
    }
}
