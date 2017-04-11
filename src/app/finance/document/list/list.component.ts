import { Component, OnInit, ViewContainerRef, NgZone }  from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Http, Headers, Response, RequestOptions, URLSearchParams }
  from '@angular/http';
import * as HIHCommon from '../../../model/common';
import * as HIHFinance from '../../../model/financemodel';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { TdDataTableService, TdDataTableSortingOrder, ITdDataTableSortChangeEvent, ITdDataTableColumn } from '@covalent/core';
import { IPageChangeEvent } from '@covalent/core';
import { UIStatusService } from '../../../services/uistatus.service';
import { AuthService } from '../../../services/auth.service';
import { TdDialogService } from '@covalent/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'finance-document-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.css']
})
export class ListComponent implements OnInit {
  private _apiUrl: string;
  public listData: Array<HIHFinance.DocumentType> = [];
  clnhdrstring: string[] = ["Common.ID", "Finance.DocumentType", "Finance.TransactionDate", "Finance.Amount", "Finance.Currency"];
  columns: ITdDataTableColumn[] = [
    { name: 'Id', label: '#', tooltip: 'ID' },
    { name: 'DocTypeName', label: 'Doc Type', tooltip: 'Document Type' },
    { name: 'TranDateString', label: 'Tran Date', tooltip: 'Tran. Date' },
    { name: 'TranAmount', label: 'Amount', numeric: true, format: (value) => { if (value) return value.toFixed(2); return 0.0;  } },
    { name: 'TranCurr', label: 'Currency' }
  ];
  filteredData: any[];
  filteredTotal: number;
  searchTerm: string = '';
  fromRow: number = 1;
  currentPage: number = 1;
  pageSize: number = 20;
  sortBy: string = 'Id';
  selectable: boolean = true;
  selectedRows: any[] = [];
  searchBox = {
    searchVisible: false
  };
  sortOrder: TdDataTableSortingOrder = TdDataTableSortingOrder.Descending;

  constructor(private _http: Http,
     private _router: Router,
     private _activateRoute: ActivatedRoute,
     private _zone: NgZone,
     private _dialogService: TdDialogService,
     private _viewContainerRef: ViewContainerRef,
     private _uistatus: UIStatusService,
     private _authService: AuthService,
     private _tranService: TranslateService,
     private _dataTableService: TdDataTableService) {
    if (environment.DebugLogging) {
      console.log("Entering constructor of FinanceDocumentList");
    }
    this._apiUrl = environment.ApiUrl + "api/financedocument";

    this._uistatus.subjCurLanguage.subscribe(x => {
      if (environment.DebugLogging) {
        console.log("Language changed in FinanceDocumentList:" + x);
      }
      
      this.loadHeaderString();
    });
  }

  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("Entering ngOnInit of FinanceDocumentList");
    }

    this.loadDocumentList();
  }

  loadDocumentList(): void {
    if (environment.DebugLogging) {
      console.log("Entering loadDocumentList of FinanceDocumentList");
    }

    let headers = new Headers();
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');
    if (this._authService.authSubject.getValue().isAuthorized) {
      headers.append('Authorization', 'Bearer ' + this._authService.authSubject.getValue().getAccessToken());
    }
    this._http.get(this._apiUrl, { headers: headers })
      .map(this.extractData)
      .catch(this.handleError)
      .subscribe(data => {
        if (data instanceof Array) {
          this.listData = data;
          this.filter();
          // this.filteredData = this.listData;
          // this.filteredTotal = this.listData.length;
        }          
      },
      error => {
        // It should be handled already
      },
      () => {
        // Finished
      });
  }

  private extractData(res: Response) {
    if (environment.DebugLogging) {
      console.log("Entering extractData of FinanceDocumentList");
    }

    let body = res.json();
    if (body && body.contentList && body.contentList instanceof Array) {
      let sets = new Array<HIHFinance.Document>();
      for (let alm of body.contentList) {
        let alm2 = new HIHFinance.Document();
        alm2.onSetData(alm);
        sets.push(alm2);
      }
      return sets;
    }

    return body || {};
  }

  private handleError(error: any) {
    if (environment.DebugLogging) {
      console.log("Entering handleError of FinanceDocumentList");
    }

    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }

  sort(sortEvent: ITdDataTableSortChangeEvent): void {
    this.sortBy = sortEvent.name;
    this.sortOrder = sortEvent.order;
    this.filter();
  }

  search(searchTerm: string): void {
    this.searchTerm = searchTerm;
    this.filter();
  }
  
  page(pagingEvent: IPageChangeEvent): void {
    this.fromRow = pagingEvent.fromRow;
    this.currentPage = pagingEvent.page;
    this.pageSize = pagingEvent.pageSize;
    this.filter();
  }

  filter(): void {
    if (this.listData) {
      let newData: any[] = this.listData;
      newData = this._dataTableService.filterData(newData, this.searchTerm, true);
      this.filteredTotal = newData.length;
      newData = this._dataTableService.sortData(newData, this.sortBy, this.sortOrder);
      newData = this._dataTableService.pageData(newData, this.fromRow, this.currentPage * this.pageSize);
      this.filteredData = newData;
    }
  }
  
  public onCreateNormalDocument() : void {
    if (environment.DebugLogging) {
      console.log("Entering onCreateNormalDocument of FinanceDocumentList");
    }
    this._router.navigate(['/finance/document/create']);
  }

  public onCreateTransferDocument() : void {
    if (environment.DebugLogging) {
      console.log("Entering onCreateTransferDocument of FinanceDocumentList");
    }
    this._router.navigate(['/finance/document/createtransfer']);
  }

  public onCreateAdvPayDocument() : void {
    if (environment.DebugLogging) {
      console.log("Entering onCreateAdvPayDocument of FinanceDocumentList");
    }
    this._router.navigate(['/finance/document/createadvpay']);
  }

  public onDisplayDocument() {
    if (environment.DebugLogging) {
      console.log("Entering onDisplayDocument of FinanceDocumentList");
    }

    if (this.selectedRows.length != 1) {
      this._dialogService.openAlert({
        message: "Select one and only one row to continue!",
        disableClose: false, // defaults to false
        viewContainerRef: this._viewContainerRef, //OPTIONAL
        title: "Selection error", //OPTIONAL, hides if not provided
        closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
      });
      return;
    }
    
    if (this.selectedRows[0].DocType === HIHCommon.FinanceDocType_Transfer) {
      this._router.navigate(['/finance/document/displaytransfer/' + this.selectedRows[0].Id.toString()]);
    } else if (this.selectedRows[0].DocType === HIHCommon.FinanceDocType_AdvancePayment) {
      this._router.navigate(['/finance/document/displayadvpay/' + this.selectedRows[0].Id.toString()]);
    } else {
      this._router.navigate(['/finance/document/display/' + this.selectedRows[0].Id.toString()]);
    }    
  }

  public onEditDocument() {
    if (environment.DebugLogging) {
      console.log("Entering onCreateDocument of FinanceDocumentList");
    }

    if (this.selectedRows.length != 1) {
      this._dialogService.openAlert({
        message: "Select one and only one row to continue!",
        disableClose: false, // defaults to false
        viewContainerRef: this._viewContainerRef, //OPTIONAL
        title: "Selection error", //OPTIONAL, hides if not provided
        closeButton: 'Close', //OPTIONAL, defaults to 'CLOSE'
      });
      return;
    }
    
    if (this.selectedRows[0].DocType === HIHCommon.FinanceDocType_Transfer) {
      this._router.navigate(['/finance/document/edittransfer/' + this.selectedRows[0].Id.toString()]);
    } else if (this.selectedRows[0].DocType === HIHCommon.FinanceDocType_AdvancePayment) {
      this._router.navigate(['/finance/document/editadvpay/' + this.selectedRows[0].Id.toString()]);
    } else {
      this._router.navigate(['/finance/document/edit/' + this.selectedRows[0].Id.toString()]);
    }    
  }

  public onDeleteDocument() {
    if (environment.DebugLogging) {
      console.log("Entering onDeleteDocument of FinanceDocumentList");
    }    
  }

  private loadHeaderString(): void {
    this._tranService.get(this.clnhdrstring).subscribe(x => {
      for(let i = 0; i < this.columns.length; i ++) {
        this.columns[i].label = x[this.clnhdrstring[i]];
      }
    }, error => {
    }, () => {
    });    
  }
}
