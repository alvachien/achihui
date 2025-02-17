import { Component } from '@angular/core';
import { NzResultModule } from 'ng-zorro-antd/result';
import { TranslocoModule } from '@jsverse/transloco';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { UIStatusService } from '@services/index';

@Component({
  selector: 'hih-fatal-error',
  templateUrl: './fatal-error.component.html',
  styleUrls: ['./fatal-error.component.less'],
  imports: [
    NzResultModule,
    NzButtonModule,
    TranslocoModule
  ]
})
export class FatalErrorComponent {
  errorContext = '';

  constructor(private uiStatus: UIStatusService) {
    if (this.uiStatus.latestError) {
      this.errorContext = this.uiStatus.latestError;
    }
  }
}
