import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';

import { UIAccountForSelection, UIOrderForSelection, ControlCenter, TranType } from '../../../../model';
import { TranslocoModule } from '@jsverse/transloco';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number';

@Component({
  selector: 'hih-document-normal-mass-create-item',
  templateUrl: './document-normal-mass-create-item.component.html',
  styleUrls: ['./document-normal-mass-create-item.component.less'],
  imports: [
    FormsModule,
    ReactiveFormsModule,
    NzFormModule,
    NzInputModule,
    NzDatePickerModule,
    NzSelectModule,
    NzInputNumberModule,
    TranslocoModule,
  ]
})
export class DocumentNormalMassCreateItemComponent {
  @Input()
  public arUIAccounts: UIAccountForSelection[] = [];
  @Input()
  public arUIOrders: UIOrderForSelection[] = [];
  @Input()
  arControlCenters: ControlCenter[] = [];
  @Input()
  arTranType: TranType[] = [];
  @Input()
  baseCurrency?: string;
  @Input()
  public itemFormGroup?: UntypedFormGroup;

  constructor() {
    // Empty
  }
}
