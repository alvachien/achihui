import { environment } from '../../environments/environment';
import { User } from 'oidc-client';

/**
 * User detail
 */
export class UserDetail {
  // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public UserId: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public DisplayAs: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention,no-underscore-dangle,id-blacklist,id-match
  public Email: string;
  // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
  public Others: string;

  public onSetData(data: any): void {
    this.UserId = data.userID;
    this.DisplayAs = data.displayAs;
    this.Email = data.email;
    this.Others = data.others;
  }

  public onGetData(): any {
    const data: any = {};
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
  private currentUser: User;
  private userName: string;
  private userId: string;
  private userMailbox: string;
  private accessToken: string;

  public isAuthorized: boolean;

  public setContent(user: User): void {
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

  public cleanContent(): void {
    this.currentUser = undefined;
    this.isAuthorized = false;
    this.userName = undefined;
    this.userId = undefined;
    this.userMailbox = undefined;
    this.accessToken = undefined;
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
