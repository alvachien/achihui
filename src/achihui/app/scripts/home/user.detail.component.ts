import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { DebugLogging } from '../app.setting';
import * as HIHUser from '../model/user';
import { DialogService } from '../services/dialog.service';
import { UserInfo, AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';

@Component({
    selector: 'hih-home-userdetail',
    templateUrl: 'app/views/home/userdetail.html'
})

export class UserDetailComponent implements OnInit, OnDestroy {
    public userDetail: HIHUser.UserDetail = null;
    private subUserDetail: Subscription = null;
    private isCreate: boolean = false;
    private userInfo: UserInfo = null;

    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        public dialogService: DialogService,
        private userService: UserService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of UserDetailComponent");
        }

        this.userDetail = new HIHUser.UserDetail();
        this.authService.authContent.subscribe(x => {
            if (x.isAuthorized) {
                this.userInfo = x;
            } else {
                if (DebugLogging) {
                    console.log("Fatal error: no authorized user reached User Detail page!!");
                }
            }
        });

        if (!this.subUserDetail) {
            this.subUserDetail = this.userService.userDetail$.subscribe(
                data => this.getUserDetail(data),
                error => this.handleUserDetailError(error));
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of UserDetailComponent");
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of UserDetailComponent");
        }
    }

    getUserDetail(data: HIHUser.UserDetail) {
        if (DebugLogging) {
            console.log("Entering getUserDetail of UserDetailComponent");
        }

        this.zone.run(() => {
            this.userDetail = data;
        });
    }

    handleUserDetailError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of UserDetailComponent");
        }
        console.log(error);

        if (DebugLogging) {
            console.log("It seems no user detail set yet, using initial value");
        }
        this.isCreate = true;

        this.zone.run(() => {
            this.userDetail = new HIHUser.UserDetail();
            this.userDetail.UserId = this.userInfo.getUserId();
            this.userDetail.DisplayAs = this.userInfo.getUserName();
            this.userDetail.Email = this.userInfo.getUserName();
        });
    }

    onSubmit() {
        if (DebugLogging) {
            console.log("Entering onSubmit of UserDetailComponent");
        }

        // Do the base UI validation

        // Then, submit to the server
        if (this.isCreate) {
            this.userService.createUserDetail(this.userDetail);
        } else {
            this.userService.updateUserDetail(this.userDetail);
        }
    }
}
