import { Component, OnInit } from '@angular/core';
import { environment } from '../../environments/environment';
import { LogLevel, HomeDef, HomeMember, HomeDefJson, HomeMemberJson } from '../model';
import { AuthService, HomeDefDetailService } from '../services';

@Component({
  selector: 'app-page-home-detail',
  templateUrl: './page-home-detail.component.html',
  styleUrls: ['./page-home-detail.component.scss']
})
export class PageHomeDetailComponent implements OnInit {
  currentHomeDef: HomeDef | null;

  constructor(private _authService: AuthService, 
    private _homedefService: HomeDefDetailService) {
    this.currentHomeDef = new HomeDef();
    this._homedefService.listDataChange.subscribe(x => {
      if (environment.LoggingLevel >= LogLevel.Debug) {
        console.log(`AC_HIH_UI [Debug]: Entering listDataChange of PageHomeDetailComponent... ${x}`);
      }
    });
  }

  ngOnInit() {
  }

  public canSubmit(): boolean {
    if (this.currentHomeDef.Name === null || this.currentHomeDef.Name === undefined
      || this.currentHomeDef.Name.length <= 0) {
        return false;
    }

    return true;
  }

  public onSubmit(): void {
    // Submit to DB
    if (this.currentHomeDef.ID === null || this.currentHomeDef.ID === undefined) {
      this.currentHomeDef.Host = this._authService.authSubject.value.getUserId();
      this._homedefService.createHomeDef(this.currentHomeDef);
    } else {

    }
  }
}
