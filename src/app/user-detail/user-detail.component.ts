import { Component, OnInit, OnDestroy } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { LogLevel, HomeDef, HomeMember, HomeDefJson, IHomeMemberJson, UIMode, getUIModeString, UserAuthInfo } from '../model';
import { AuthService, HomeDefDetailService } from '../services';

@Component({
  selector: 'hih-user-detail',
  templateUrl: './user-detail.component.html',
  styleUrls: ['./user-detail.component.scss'],
})
export class UserDetailComponent implements OnInit, OnDestroy {
  private _destroyed$: ReplaySubject<boolean>;

  usrObject: UserAuthInfo;

  constructor(private _authService: AuthService) {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering UserDetailComponent constructor...');
    }
  }

  ngOnInit(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering UserDetailComponent ngOnInit...');
    }
    this._destroyed$ = new ReplaySubject(1);
    this._authService.authSubject.pipe(takeUntil(this._destroyed$)).subscribe((x: UserAuthInfo) => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log('AC_HIH_UI [Debug]: Entering UserDetailComponent ngOnInit, authContent...');
      }
      this.usrObject = x;
    }, (error: any) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.error(`AC HIH UI [Error]: Entering UserDetailComponent ngOnInit, Failed with : ${error}`);
      }
    }, () => {
      // Completed
    });
  }

  ngOnDestroy(): void {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering UserDetailComponent ngOnDestroy...');
    }
    this._destroyed$.next(true);
    this._destroyed$.complete();
  }
}
