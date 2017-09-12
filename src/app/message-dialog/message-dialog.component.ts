import { Component, Inject } from '@angular/core';
import { MdDialog, MdDialogRef, MD_DIALOG_DATA } from '@angular/material';

export enum MessageDialogButtonEnum {
  onlyok,
  yesno,
  okcancel,
  yesnocancel
}

export interface MessageDialogInfo {
  Header: string;
  Content: string;
  Button: MessageDialogButtonEnum;
}

@Component({
  selector: 'app-message-dialog',
  templateUrl: './message-dialog.component.html',
  styleUrls: ['./message-dialog.component.scss']
})
export class MessageDialogComponent {

  get IsOnlyOKButton(): boolean {
    return this.dlgInfo.Button === MessageDialogButtonEnum.onlyok;
  }

  get IsYesNoButton(): boolean {
    return this.dlgInfo.Button === MessageDialogButtonEnum.yesno;
  }

  get IsOKCancelButton(): boolean {
    return this.dlgInfo.Button === MessageDialogButtonEnum.okcancel;
  }

  get IsYesNoCancelButton(): boolean {
    return this.dlgInfo.Button === MessageDialogButtonEnum.yesnocancel;
  }

  constructor(public dialogRef: MdDialogRef<MessageDialogComponent>,
    @Inject(MD_DIALOG_DATA) public dlgInfo: MessageDialogInfo) {
  }
}
