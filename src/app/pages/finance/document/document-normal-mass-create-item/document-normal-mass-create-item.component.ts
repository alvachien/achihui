import { Component, OnInit, Input, Output, EventEmitter, } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { UIAccountForSelection, UIOrderForSelection, Account, ControlCenter, Order, TranType,
} from '../../../../model';

@Component({
  selector: 'hih-document-normal-mass-create-item',
  templateUrl: './document-normal-mass-create-item.component.html',
  styleUrls: ['./document-normal-mass-create-item.component.less'],
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
  baseCurrency: string;
  @Input()
  public itemFormGroup: FormGroup;

  constructor() {
    // Empty
  }
}
