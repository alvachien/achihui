import {
  Component, OnInit, OnDestroy, AfterViewInit, NgZone,
  EventEmitter, Input, Output, ViewContainerRef
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  Http, Headers, Response, RequestOptions,
  URLSearchParams
} from '@angular/http';
import {
  TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent,
  ITdDataTableColumn, ITdDataTableSelectEvent, TdDialogService
} from '@covalent/core';
import * as HIHCommon from '../../model/common';
import * as HIHFinance from '../../model/financemodel';
import * as HIHUser from '../../model/userinfo';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { UIStatusService } from '../../services/uistatus.service';
import { AuthService } from '../../services/auth.service';
import { BufferService } from '../../services/buff.service';

@Component({
  selector: 'finance-setting',
  templateUrl: './setting.component.html',
  styleUrls: ['./setting.component.scss']
})
export class SettingComponent implements OnInit {

  private _apiUrl: string;
  public localCurrency: string;
  public arCurrency: Array<HIHFinance.Currency>;

  columns: ITdDataTableColumn[] = [
    { name: 'SetId', label: '#', tooltip: 'ID' },
    { name: 'SetValue', label: 'Value', tooltip: 'Name' },
    { name: 'Comment', label: 'Comment' }
  ];
  filteredData: any[];

  constructor(private _http: Http,
    private _zone: NgZone,
    private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _dialogService: TdDialogService,
    private _viewContainerRef: ViewContainerRef,
    private _authService: AuthService,
    private _buffService: BufferService,
    private _uistatus: UIStatusService) { 
      if (environment.DebugLogging) {
        console.log("Entering constructor of SettingComponent");
      }
  }

  ////////////////////////////////////////////
  // Methods for interface methods
  ////////////////////////////////////////////
  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of SettingComponent");
    }

    Observable.forkJoin([
      this._buffService.getCurrencies(),
      this._buffService.getFinanceSettings()
    ]).subscribe(data => {
      this.arCurrency = data[0];
      if (data[1] instanceof Array) {
        this.filteredData = data[1];
      }

      for(let sv of data[1]) {
        if (sv.SetId === "LocalCurrency") {
          this.localCurrency = sv.SetValue;
        }
      }
    });
  }
}
