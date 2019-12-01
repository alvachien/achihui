import { Component, OnInit, OnDestroy } from '@angular/core';
import { forkJoin, ReplaySubject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'hih-account-ext-credit-card',
  templateUrl: './account-ext-credit-card.component.html',
  styleUrls: ['./account-ext-credit-card.component.scss'],
})
export class AccountExtCreditCardComponent implements OnInit {

  constructor() {
    // Do nothing
  }

  ngOnInit(): void {
    // DO nothing
  }
}
