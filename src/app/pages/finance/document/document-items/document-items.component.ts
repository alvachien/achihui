import { Component, OnInit, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, NG_VALIDATORS } from '@angular/forms';

import { Account, ControlCenter, Order, AccountCategory, } from '../../../../model';

@Component({
  selector: 'hih-document-items',
  templateUrl: './document-items.component.html',
  styleUrls: ['./document-items.component.less'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DocumentItemsComponent),
      multi: true,
    }, {
      provide: NG_VALIDATORS,
      useExisting: forwardRef(() => DocumentItemsComponent),
      multi: true,
    },
  ],
})
export class DocumentItemsComponent implements OnInit {
  public arAccounts: Account[] = [];

  constructor() { }

  ngOnInit() {
  }

}
