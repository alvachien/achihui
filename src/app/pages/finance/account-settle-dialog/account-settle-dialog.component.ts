import { Component } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
    selector: 'hih-account-settle-dialog',
    templateUrl: './account-settle-dialog.component.html',
    styleUrls: ['./account-settle-dialog.component.less'],
    imports: [
        TranslocoModule,
    ]
})
export class AccountSettleDialogComponent {}
