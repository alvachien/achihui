import {
    IDServerUrl, AppLoginCallback, AppLogoutCallback,
    AppHost, environment, DebugLogging
} from '../app.setting';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/map';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Observable } from 'rxjs/Observable';
declare var Oidc: any;
//import * as Oidc                    from 'oidc-client';

export class UserInfo {
    public isAuthorized: boolean;
    private currentUser: any;
    private userName: string;
    private accessToken: string;

    public cleanContent() {
        if (DebugLogging) {
            console.log("Entering cleanContent of UserService");
        }

        this.currentUser = null;
        this.isAuthorized = false;
    }
    public setContent(user) {
        if (DebugLogging) {
            console.log("Entering setContent of UserService");
        }

        if (user) {
            //this.currentUser = user;
            this.isAuthorized = true;

            this.userName = user.profile.name;
            this.accessToken = user.access_token;
            //this.galleryAlbumCreate = user.profile.GalleryAlbumCreate;
            //this.galleryAlbumChange = user.profile.GalleryAlbumChange;
            //this.galleryAlbumDelete = user.profile.GalleryAlbumDelete;
            //this.galleryPhotoUpload = user.profile.GalleryPhotoUpload;
            //this.galleryPhotoChange = user.profile.GalleryPhotoChange;
            //this.galleryPhotoDelete = user.profile.GalleryPhotoDelete;
            //this.galleryPhotoUploadSize = user.profile.GalleryPhotoUploadSize;
        } else {
            this.cleanContent();
        }
    }

    public getUserName(): string {
        if (DebugLogging) {
            console.log("Entering getUserName of UserService");
        }

        if (this.userName) {
            return this.userName;
        }

        return "";
    }
    //private getObjectRights(strValue: string, usrName?: string): boolean {
    //    if (strValue) {
    //        if (strValue === this.ForAll)
    //            return true;
    //        if (strValue === this.OnlyOwner) {
    //            if (usrName === this.userName)
    //                return true;
    //            return false;
    //        }
    //    }

    //    return false;
    //}
    //public canCreateAlbum(): boolean {
    //    return this.getObjectRights(this.galleryAlbumCreate);
    //}
    //public canChangeAlbum(crterName?: string): boolean {
    //    return this.getObjectRights(this.galleryAlbumChange, crterName);
    //}
    //public canDeleteAlbum(crterName?: string): boolean {
    //    return this.getObjectRights(this.galleryAlbumDelete, crterName);
    //}
    public getAccessToken(): string {
        if (DebugLogging) {
            console.log("Entering getAccessToken of UserService");
        }

        return this.accessToken;
    }
}

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
