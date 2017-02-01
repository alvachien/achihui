import { Component, OnInit, OnDestroy, AfterViewInit, 
   EventEmitter, Input, Output, ViewContainerRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers, Response, RequestOptions, 
  URLSearchParams } from '@angular/http';
import { TdDialogService } from '@covalent/core';
import * as HIHCommon from '../../../model/common';
import * as HIHFinance from '../../../model/financemodel';
import * as HIHUser from '../../../model/userinfo';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { UIStatusService } from '../../../services/uistatus.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'finance-account-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {
  public currentMode: string;
  public accountObject: HIHFinance.Account = null;
  public uiMode: HIHCommon.UIMode = HIHCommon.UIMode.Create;

  constructor(private _http: Http,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _dialogService: TdDialogService,
    private _viewContainerRef: ViewContainerRef,
    private _authService: AuthService,
    private _uistatus: UIStatusService) { 
      this.accountObject = new HIHFinance.Account();
      this.uiMode = HIHCommon.UIMode.Create;
    }

  ////////////////////////////////////////////
  // Methods for interface methods
  ////////////////////////////////////////////
  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of FinanceAccountDetail");
    }

    // Distinguish current mode
    this._activateRoute.url.subscribe(x => {
      if (x instanceof Array && x.length > 0) {
        if (x[0].path === "create") {
          this.currentMode = "Create";
          this.accountObject = new HIHFinance.Account();
          this.uiMode = HIHCommon.UIMode.Create;
        } else if (x[0].path === "edit") {
          this.currentMode = "Edit"
          this.uiMode = HIHCommon.UIMode.Change;
        } else if (x[0].path === "display") {
          this.currentMode = "Display";
          this.uiMode = HIHCommon.UIMode.Display;
        }

        // Update the sub module
        this._uistatus.setFinanceSubModule(this.currentMode);
      }
    }, error => {
    }, () => {
    });
  }

}
