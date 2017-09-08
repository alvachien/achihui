import { environment } from '../../environments/environment';
import { User } from 'oidc-client';

/**
 * User detail
 */
export class UserDetail {
    public UserId: string;
    public DisplayAs: string;
    public Email: string;
    public Others: string;

    public onSetData(data: any) {
        // if (environment.DebugLogging) {
        //     console.log("Entering onSetData of UserDetail");
        // }

        this.UserId = data.userID;
        this.DisplayAs = data.displayAs;
        this.Email = data.email;
        this.Others = data.others;
    }

    public onGetData() : any {
        let data : any = {};
        data.userID = this.UserId;
        data.displayAs = this.DisplayAs;
        data.email = this.Email;
        data.others = this.Others;

        return data;
    }
}


/**
 * User Auth Info
 */
export class UserAuthInfo {
    public isAuthorized: boolean;
    private currentUser: User;
    private userName: string;
    private userId: string;
    private userMailbox: string;
    private accessToken: string;

    public setContent(user: User) : void {
        if (user) {
            this.currentUser = user;
            this.isAuthorized = true;

            this.userName = user.profile.name;
            this.userId = user.profile.sub;
            this.userMailbox = user.profile.mail;
            this.accessToken = user.access_token;
        } else {
            this.cleanContent();
        }
    }

    public cleanContent() : void {
        this.currentUser = null;
        this.isAuthorized = false;
    }

    public getUserName(): string {
        return this.userName;
    }
    public getUserId(): string {
        return this.userId;
    }
    public getAccessToken(): string {
        return this.accessToken;
    }
    public getUserMailbox(): string {
        return this.userMailbox;
    }
}
