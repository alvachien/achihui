import { Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { environment } from '../../../environments/environment';
import { UIStatusService } from '../../../app/services';
import { CheckVersionResult } from '../../../app/model';

@Component({
  selector: 'hih-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.less'],
  imports: [
    NzTypographyModule,
    TranslocoModule,
    NzDividerModule
  ]
})
export class AboutComponent {
  version: string;
  resultVersion: CheckVersionResult | null = null;

  readonly uiStatus = inject(UIStatusService);
  constructor() {
    this.version = environment.CurrentVersion;

    this.resultVersion = this.uiStatus.versionResult;
  }
}
