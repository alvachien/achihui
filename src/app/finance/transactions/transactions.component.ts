import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'finance-transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.scss']
})
export class TransactionsComponent implements OnInit {

  public tabLinks: any[] = [];

  constructor() { 
    this.tabLinks = [
      { label: 'Account List', link: '/finance/transactions/accountlist'},
      { label: 'Control Center List', link: '/finance/transactions/cclist'},
      { label: 'Order List', link: '/finance/transactions/orderlist'},
      { label: 'Account Hierarchy', link: '/finance/transactions/accounthierarchy'},
      { label: 'Control Center Hierarchy', link: '/finance/transactions/cchierarchy'}
    ];
  }

  ngOnInit() {
  }
}
