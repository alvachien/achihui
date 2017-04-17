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
  columns: ITdDataTableColumn[] = [
    { name: 'SetId', label: '#', tooltip: 'ID' },
    { name: 'SetValue', label: 'Value', tooltip: 'Name' },
    { name: 'Comment', label: 'Comment' }
  ];
  filteredData: any[];
  selectable: boolean = true;
  selectedRows: any[] = [];

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
        console.log("Entering constructor of FinanceOrderList");
      }
  }

  ////////////////////////////////////////////
  // Methods for interface methods
  ////////////////////////////////////////////
  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of SettingComponent");
    }

    this.loadSetting();
  }
  loadSetting(): void {
    if (environment.DebugLogging) {
      console.log("Entering loadSetting of SettingComponent");
    }

    this._buffService.getFinanceSettings()
      .subscribe(data => {
        if (data instanceof Array) {
          this.filteredData = data;
        }
      },
      error => {
        // It should be handled already
      },
      () => {
        // Finished
      });
  }
}
