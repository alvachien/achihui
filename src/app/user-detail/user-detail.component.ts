import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { LogLevel, HomeDef, HomeMember, HomeDefJson, IHomeMemberJson, UIMode, getUIModeString, UserAuthInfo } from '../model';
import { AuthService, HomeDefDetailService } from '../services';

@Component({
  selector: 'hih-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
})
export class UserDetailComponent implements OnInit {
  usrObject: UserAuthInfo;

  constructor(private _authService: AuthService,
    private _homedefService: HomeDefDetailService) {
    // Do nothing
    this._authService.authContent.subscribe((x: UserAuthInfo) => {
      this.usrObject = x;
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error('AC HIH UI [Error]: Failed in subscribe to User', error);
      }
    }, () => {
      // Completed
    });
  }

  ngOnInit(): void {
    // Do nothing
  }
}
