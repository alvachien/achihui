import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzResultModule } from 'ng-zorro-antd/result';

@Component({
    selector: 'hih-event-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.less'],
    imports: [
        NzResultModule,
        NzButtonModule,
        TranslocoModule,
    ]
})
export class SearchComponent { }
