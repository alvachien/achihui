import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NzResultModule } from 'ng-zorro-antd/result';

@Component({
    selector: 'hih-lack-authority',
    templateUrl: './lack-authority.component.html',
    styleUrls: ['./lack-authority.component.less'],
    imports: [
        NzResultModule, 
        TranslocoModule
    ]
})
export class LackAuthorityComponent {}
