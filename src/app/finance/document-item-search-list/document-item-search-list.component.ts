import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { GeneralFilterOperatorEnum, GeneralFilterItem, UIDisplayString, UIDisplayStringUtil, DocumentItem } from '../../model';
import { Observable, forkJoin, merge, of } from 'rxjs';
import { catchError, map, startWith, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { HttpParams, HttpClient, HttpHeaders, HttpResponse, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { MatPaginator, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'hih-fin-document-item-search-list',
  templateUrl: './document-item-search-list.component.html',
  styleUrls: ['./document-item-search-list.component.scss'],
})
export class DocumentItemSearchListComponent implements OnInit, AfterViewInit {
  filters: GeneralFilterItem[] = [];
  allOperators: UIDisplayString[] = [];
  allFields: any[] = [];
  filterEditable: boolean = true;
  displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  dataSource: any = new MatTableDataSource<DocumentItem>();

  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private _http: HttpClient,
    private _authService: AuthService) {
    this.allOperators = UIDisplayStringUtil.getGeneralFilterOperatorDisplayStrings();
    this.allFields = [{
      displayas: 'Finance.TransactionType',
      value: 'tranType',
    }, {
      displayas: 'Finance.Currency',
      value: 'currency',
    }, {
      displayas: 'Finance.Account',
      value: 'account',
    }, {
      displayas: 'Finance.ControlCenter',
      value: 'controlCenter',
    }, {
      displayas: 'Finance.Order',
      value: 'order',
    },
    ];
  }

  ngOnInit(): void {
    this.onAddFilter();
  }

  /**
   * Set the paginator after the view init since this component will
   * be able to query its view for the initialized paginator.
   */
  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  public onAddFilter(): void {
    this.filters.push(new GeneralFilterItem());
  }
  public onRemoveFilter(idx: number): void {
    this.filters.splice(idx, 1);
  }
  public onSearch(): void {
    // Do the real search
  }
}
