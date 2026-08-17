import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { environment } from '@environments/environment';
import { UIStatusService } from '@services/index';

@Component({
  selector: 'hih-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzTypographyModule, TranslocoModule, NzDividerModule],
})
export class AboutComponent {
  version: string;
  readonly uiStatus = inject(UIStatusService);
  // Reactive view of the API/storage version set by AppComponent's checkDBVersion.
  readonly resultVersion = computed(() => this.uiStatus.versionResult);

  constructor() {
    this.version = environment.CurrentVersion;
  }
}
