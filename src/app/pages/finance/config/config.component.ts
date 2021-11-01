import { Component, OnInit } from '@angular/core';

import { FinanceOdataService, UIStatusService, HomeDefOdataService } from '../../../services';

@Component({
  selector: 'hih-finance-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.less'],
})
export class ConfigComponent {
  constructor(private homeService: HomeDefOdataService) {
  }

  get isChildMode(): boolean {
    return this.homeService.CurrentMemberInChosedHome!.IsChild;
  }
}
