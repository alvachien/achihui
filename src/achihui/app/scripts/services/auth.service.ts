import {
    IDServerUrl, AppLoginCallback, AppLogoutCallback,
    AppHost, environment, DebugLogging
} from '../app.setting';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
import { UserInfo } from './user.service';
declare var Oidc: any;
//import * as Oidc                    from 'oidc-client';

@Injectable()
export class AuthService {
    public authSubject: BehaviorSubject<UserInfo> = new BehaviorSubject(new UserInfo());

    public authContent: Observable<UserInfo> = this.authSubject.asObservable();

    private mgr: any = null;

    constructor() {
        if (DebugLogging) {
            console.log("Entering constructor of AuthService");
        }

        let settings = {
            authority: IDServerUrl,
            client_id: "achihui.js",
            redirect_uri: AppLoginCallback,
            response_type: "id_token token",
            scope: "openid profile api.hihapi",
            post_logout_redirect_uri: AppLogoutCallback
        };

        this.mgr = new Oidc.UserManager(settings);
        var that = this;
        this.mgr.getUser().then(function (u) {
            if (u) {
                that.authSubject.value.setContent(u);
            }
            else {
                that.authSubject.value.cleanContent();
            }

            that.authSubject.next(that.authSubject.value);
        }, function (reason) {
        });

        this.mgr.events.addUserUnloaded((e) => {
            if (DebugLogging) {
                console.log("user unloaded");
            }
            that.authSubject.value.cleanContent();

            that.authSubject.next(that.authSubject.value);
        });
    }

    public doLogin() {
        if (DebugLogging) {
            console.log("Entering doLogin of AuthService");
        }

        if (this.mgr) {
            this.mgr.signinRedirect().then(function () {
                    if (DebugLogging) {
                        console.info("redirecting for login...");
                    }
                })
                .catch(function (er) {
                    if (DebugLogging) {
                        console.error("Sign-in error", er);
                    }
                });
        }
    }

    public doLogout() {
        if (DebugLogging) {
            console.log("Entering doLogout of AuthService");
        }

        if (this.mgr) {
            this.mgr.signoutRedirect().then(function () {
                    if (DebugLogging) {
                        console.info("redirecting for logout...");
                    }
                })
                .catch(function (er) {
                    if (DebugLogging) {
                        console.error("Sign-out error", er);
                    }
                });
        }
    }
}
