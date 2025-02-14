import { Component } from '@angular/core';

import { environment } from '../../../environments/environment';
import { UIStatusService } from '../../../app/services';
import { CheckVersionResult } from '../../../app/model';

@Component({
    selector: 'hih-about',
    templateUrl: './about.component.html',
    styleUrls: ['./about.component.less'],
    standalone: false
})
export class AboutComponent {
  version: string;
  resultVersion: CheckVersionResult | null = null;

  constructor(private uiStatus: UIStatusService) {
    this.version = environment.CurrentVersion;

    this.resultVersion = this.uiStatus.versionResult;
  }
}
