import { Component } from '@angular/core';

import { UIStatusService } from '../../services';
import { NzResultModule } from 'ng-zorro-antd/result';
import { TranslocoModule } from '@jsverse/transloco';
import { NzButtonModule } from 'ng-zorro-antd/button';

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
