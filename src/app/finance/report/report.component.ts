import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'finance-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  public tabLinks: any[] = [];

  activeLinkIndex = 0;
  constructor() { 
    this.  tabLinks = [
      {label: 'Balance Sheet', link: '/finance/report/bs'},
      {label: 'Control Center', link: '/finance/report/controlcenter'},
      {label: 'Order', link: '/finance/report/order'},
    ];
  }

  ngOnInit() {
  }
}
