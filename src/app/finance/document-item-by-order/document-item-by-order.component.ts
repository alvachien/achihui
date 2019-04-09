import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material';

import { environment } from '../../../environments/environment';
import { LogLevel, ControlCenter, DocumentItemWithBalance, OverviewScopeEnum, getOverviewScopeRange,
  TranType, UICommonLabelEnum, } from '../../model';

@Component({
  selector: 'hih-document-item-by-order',
  templateUrl: './document-item-by-order.component.html',
  styleUrls: ['./document-item-by-order.component.scss'],
})
export class DocumentItemByOrderComponent implements OnInit {

  displayedColumns: string[] = ['DocID', 'TranDate', 'TranType', 'TranAmount', 'Desp', 'Balance'];
  arTranType: TranType[] = [];
  dataSource: any = new MatTableDataSource<DocumentItemWithBalance>();
  isLoadingResults: boolean;
  resultsLength: number;

  constructor() { }

  ngOnInit() {
  }

}
