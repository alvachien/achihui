import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { DebugLogging } from '../app.setting';
import * as HIHUser from '../model/user';
import { DialogService } from '../services/dialog.service';
import { UserInfo, AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { BufferService } from '../services/buffer.service';

@Component({
    selector: 'hih-home-userdetail',
    templateUrl: 'app/views/home/userdetail.html'
})
export class UserDetailComponent implements OnInit, OnDestroy {
    public userDetail: HIHUser.UserDetail = null;
    private subUserDetail: Subscription = null;
    private isCreateMode: boolean = false;
    private userInfo: UserInfo = null;

    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        private dialogService: DialogService,
        private userService: UserService,
        private authService: AuthService,
        private buffService: BufferService) {
        if (DebugLogging) {
            console.log("Entering constructor of UserDetailComponent");
        }

        this.userDetail = new HIHUser.UserDetail();
        if (this.authService.authSubject.value && this.authService.authSubject.value.isAuthorized) {
            this.userInfo = this.authService.authSubject.value;
        } else {
            if (DebugLogging) {
                console.log("Fatal error: no authorized user reached User Detail page!!");
            }
        }

        if (buffService.isUserDetailLoaded) {
            this.userDetail = buffService.usrDetail;
        } else {
            if (DebugLogging) {
                console.log("It seems no user detail set yet, using initial value");
            }
            this.isCreateMode = true;

            this.userDetail = new HIHUser.UserDetail();
            this.userDetail.UserId = this.userInfo.getUserId();
            this.userDetail.DisplayAs = this.userInfo.getUserName();
            this.userDetail.Email = this.userInfo.getUserName();
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

    getUpdatedUserDetail(data: HIHUser.UserDetail) {
        if (DebugLogging) {
            console.log("Entering getUpdatedUserDetail of UserDetailComponent");
        }

        this.onUnregisterDetailChange();
        this.dialogService.prompt("User detail created or updated successfully!");

        this.zone.run(() => {
            this.userDetail = data;
        });
    }

    handleUserDetailError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleUserDetailError of UserDetailComponent");
        }
        console.error(error);

        this.onUnregisterDetailChange();
        this.dialogService.confirm("User detail created or updated failed: " + error);
    }

    private onRegisterDetailChange() {
        if (!this.subUserDetail) {
            this.subUserDetail = this.userService.userDetail$.subscribe(
                data => this.getUpdatedUserDetail(data),
                error => this.handleUserDetailError(error));
        }
    }

    private onUnregisterDetailChange() {
        this.subUserDetail.unsubscribe();
        this.subUserDetail = null;
    }

    onSubmit() {
        if (DebugLogging) {
            console.log("Entering onSubmit of UserDetailComponent");
        }

        // Do the base UI validation

        // Then, submit to the server
        this.onRegisterDetailChange();
        if (this.isCreateMode) {
            this.userService.createUserDetail(this.userDetail);
        } else {
            this.userService.updateUserDetail(this.userDetail);
        }
    }
}
