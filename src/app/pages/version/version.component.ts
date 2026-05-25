import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';

@Component({
    selector: 'hih-version',
    templateUrl: './version.component.html',
    styleUrls: ['./version.component.less'],
    imports: [
        NzTimelineModule,

        NzIconModule,
        TranslocoModule
    ]
})
export class VersionComponent { }
