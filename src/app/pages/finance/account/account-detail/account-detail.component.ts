import { Component, OnInit } from '@angular/core';
import { ReplaySubject } from 'rxjs';

@Component({
  selector: 'hih-fin-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.less']
})
export class AccountDetailComponent implements OnInit {
  // tslint:disable-next-line:variable-name
  private _destroyed$: ReplaySubject<boolean>;
  isLoadingResults: boolean;

  constructor() { }

  ngOnInit() {
  }

}
