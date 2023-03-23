import { Component } from '@angular/core';

import { HomeDefOdataService } from '../../../services';

@Component({
  selector: 'hih-finance-config',
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.less'],
})
export class ConfigComponent {
  constructor(private homeService: HomeDefOdataService) {}

  get isChildMode(): boolean {
    return this.homeService.CurrentMemberInChosedHome?.IsChild ?? false;
  }
}
