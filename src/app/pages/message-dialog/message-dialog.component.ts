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

  constructor() { }

  ngOnInit() {
  }
}

// Popup dialog
export function popupDialog(header: string, content: string): void {
  this.modalService.create({
    nzTitle: header,
    nzContent: content,
    nzClosable: true,
    // nzOnOk: () => new Promise(resolve => setTimeout(resolve, 1000))
  });
}

