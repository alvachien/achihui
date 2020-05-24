import { Component, OnInit } from '@angular/core';

import { environment } from '../../../environments/environment';
import { UIStatusService } from '../../../app/services';
import { CheckVersionResult } from '../../../app/model';

@Component({
  selector: 'hih-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.less'],
})
export class AboutComponent {

  version: string;
  // relDate: string;
  resultVersion: CheckVersionResult;

  constructor(private uiStatus: UIStatusService) {
    this.version = environment.CurrentVersion;
    // this.relDate = environment.ReleasedDate;

    this.resultVersion = this.uiStatus.versionResult;
  }
}
