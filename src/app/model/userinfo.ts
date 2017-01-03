import { environment } from '../../environments/environment';

export class UserDetail {
    public UserId: string;
    public DisplayAs: string;
    public Email: string;
    public Others: string;

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of UserDetail");
        }

        this.UserId = data.userID;
        this.DisplayAs = data.displayAs;
        this.Email = data.email;
        this.Others = data.others;
    }
}

export class UserHistory {
    public UserId: string;
    public SeqNo: number;
    public HistType: number;
    public TimePoint: Date;
    public Others: string;

    public onSetData(data: any) {
        if (environment.DebugLogging) {
            console.log("Entering onSetData of UserHistory");
        }

        this.UserId = data.userId;
        this.SeqNo = data.seqNo;
        this.HistType = data.histType;
        this.TimePoint = data.timePoint;
        this.Others = data.others;
    }
}

export class UserAuthInfo {
    public isAuthorized: boolean;
    private currentUser: any;
    private userName: string;
    private accessToken: string;

    public setContent(user: any) : void {
        if (user) {
            this.currentUser = user;
            this.isAuthorized = true;

            this.userName = user.profile.name;
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
    public getAccessToken(): string {
        return this.accessToken;
    }
}
