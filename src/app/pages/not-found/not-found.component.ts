import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzResultModule } from 'ng-zorro-antd/result';

@Component({
    selector: 'hih-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.less'],
    imports: [
        NzResultModule,
        NzButtonModule,
        TranslocoModule,
    ]
})
export class NotFoundComponent {}
