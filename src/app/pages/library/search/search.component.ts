import { Component } from '@angular/core';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { TranslocoModule } from '@jsverse/transloco';

import { ModelUtility, ConsoleLogTypeEnum } from '@model/index';

@Component({
    selector: 'hih-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.less'],
    imports: [
      NzResultModule,
      NzButtonModule,
      TranslocoModule,
    ]
})
export class SearchComponent {
  constructor() {
    ModelUtility.writeConsoleLog(
      'AC_HIH_UI [Debug]: Entering SearchComponent constructor...',
      ConsoleLogTypeEnum.debug
    );
  }
}
