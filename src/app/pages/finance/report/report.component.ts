import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'hih-finance-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.less'],
})
export class ReportComponent implements OnInit {

  constructor(public router: Router) { }

  ngOnInit() {
  }

  onDrillDownToAccount() {
    this.router.navigate(['/finance/report/account']);
  }
  onDrillDownToControlCenter() {
    this.router.navigate(['/finance/report/controlcenter']);
  }
  onDrillDownToOrder() {
    this.router.navigate(['/finance/report/order']);
  }
}
