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
import * as HIHUser from '../../../model/userinfo';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { UIStatusService } from '../../../services/uistatus.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-transferdoc',
  templateUrl: './transferdoc.component.html',
  styleUrls: ['./transferdoc.component.scss']
})
export class TransferdocComponent implements OnInit {

  constructor() { 
    
  }

  ngOnInit() {
  }

}
