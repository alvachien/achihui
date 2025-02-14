import { Component } from '@angular/core';

import { UIStatusService } from '../../services';

@Component({
    selector: 'hih-fatal-error',
    templateUrl: './fatal-error.component.html',
    styleUrls: ['./fatal-error.component.less'],
    standalone: false
})
export class FatalErrorComponent {
  errorContext = '';

  constructor(private uiStatus: UIStatusService) {
    if (this.uiStatus.latestError) {
      this.errorContext = this.uiStatus.latestError;
    }
  }
}
