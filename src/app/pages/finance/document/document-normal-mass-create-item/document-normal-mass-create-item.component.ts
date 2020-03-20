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
  localCurrency;
  @Input()
  public itemFormGroup: FormGroup;

  @Output()
  createItemClicked = new EventEmitter<any>();
  @Output()
  copyItemClicked = new EventEmitter<any>();
  @Output()
  removeItemClicked = new EventEmitter<any>();

  constructor() {
    // Empty
  }

  fireCreateItemEvent(): void {
    this.createItemClicked.emit();
  }
  fireCopyItemEvent(): void {
    this.copyItemClicked.emit();
  }
  fireRemoveItemEvent(): void {
    this.removeItemClicked.emit();
  }
}
