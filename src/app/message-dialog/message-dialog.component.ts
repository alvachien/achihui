import { Component, Inject } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { InfoMessage } from '../model';

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
  styleUrls: ['./message-dialog.component.scss'],
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

  constructor(public dialogRef: MatDialogRef<MessageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public dlgInfo: MessageDialogInfo) {
  }
}
