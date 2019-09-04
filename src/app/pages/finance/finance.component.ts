import { Component, OnInit } from '@angular/core';
import { Observable, merge, of, ReplaySubject } from 'rxjs';
import { catchError, map, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { environment } from '../../../environments/environment';
import { LogLevel, Currency } from '../../model';
import { FinCurrencyService } from '../../services';

@Component({
  selector: 'hih-finance',
  templateUrl: './finance.component.html',
  styleUrls: ['./finance.component.less'],
})
export class FinanceComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
}
