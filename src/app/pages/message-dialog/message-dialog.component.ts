import { Component, OnInit } from '@angular/core';
import { NzModalService } from 'ng-zorro-antd/modal';

import { InfoMessage } from '../../model';

/**
 * Message dialog button type
 */
export enum MessageDialogButtonEnum {
  onlyok,
  yesno,
  okcancel,
  yesnocancel,
}

/**
 * Message dialog info
 */
export interface MessageDialogInfo {
  Header: string;
  Content?: string;
  ContentTable?: InfoMessage[];
  Button: MessageDialogButtonEnum;
}


@Component({
  selector: 'hih-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.less'],
})
export class MessageDialogComponent implements OnInit {
  isVisible = false;
  constructor() { }

  ngOnInit() {
    this.isVisible = true;
  }

  handleOk() {
    this.isVisible = false;
  }
  handleCancel() {
    this.isVisible = false;
  }
}

// Popup dialog
export function popupDialog(header: string, msg: InfoMessage[]): void {
}

