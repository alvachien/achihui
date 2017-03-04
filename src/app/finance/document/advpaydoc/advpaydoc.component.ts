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
import * as HIHCommon from '../../../model/common';
import * as HIHFinance from '../../../model/financemodel';
import * as HIHUI from '../../../model/uimodel';
import * as HIHUser from '../../../model/userinfo';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { UIStatusService } from '../../../services/uistatus.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-advpaydoc',
  templateUrl: './advpaydoc.component.html',
  styleUrls: ['./advpaydoc.component.scss']
})
export class AdvpaydocComponent implements OnInit {
  private routerID: number; // Current ID in routing
  private _apiUrl: string;
  private arUsers: Array<HIHUser.UserDetail> = [];
  private arDocType: Array<HIHFinance.DocumentType> = [];
  private arAccount: Array<HIHFinance.Account> = [];
  private arControlCenter: Array<HIHFinance.ControllingCenter> = [];
  private arOrder: Array<HIHFinance.Order> = [];
  private arCurrency: Array<HIHFinance.Currency> = [];
  private arTranType: Array<HIHFinance.TranType> = [];
  public currentMode: string;
  public docObject: HIHFinance.Document = null;
  public uiObject: HIHUI.UIFinTransferDocument = null;
  public uiMode: HIHCommon.UIMode = HIHCommon.UIMode.Create;

  constructor() { }

  ngOnInit() {
  }

}
