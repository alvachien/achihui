import { Component } from '@angular/core';
import { ConsoleLogTypeEnum, ModelUtility } from 'src/app/model';

@Component({
  selector: 'hih-document-item-insight',
  templateUrl: './document-item-insight.component.html',
  styleUrls: ['./document-item-insight.component.less'],
})
export class DocumentItemInsightComponent {
  options = [
    { label: 'By Calendar Date', value: 'Date', icon: 'calendar' },
    { label: 'By Account', value: 'Account', icon: 'account-book' }
  ];

  handleOptionChange(event: any): void {
    ModelUtility.writeConsoleLog(
      `AC_HIH_UI [Debug]: Entering DocumentItemInsightComponent handleOptionChange: ${event}...`,
      ConsoleLogTypeEnum.debug
    );
  }
}
