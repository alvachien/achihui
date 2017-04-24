import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'finance-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {

  public tabLinks: any[] = [];

  activeLinkIndex = 0;
  constructor() { 
    this.  tabLinks = [
      {label: 'Account Hierarchy View', link: '/finance/transactions/'},
      {label: 'Account List View', link: '/finance/transactions/accountlist'},
      {label: 'Control Center Hierarchy View', link: '/finance/transactions/cchierarchy'},
      {label: 'Control Center List View', link: '/finance/transactions/cclist'},
      {label: 'Order List View', link: '/finance/transactions/orderlist'}
    ];
  }

  ngOnInit() {
  }
}
