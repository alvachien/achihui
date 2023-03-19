import { Component, Input } from "@angular/core";
import { NzModalRef, NzModalService } from "ng-zorro-antd/modal";

import { InfoMessage } from "../../model";

/* eslint-disable @typescript-eslint/no-explicit-any */

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
  selector: "hih-message-dialog",
  templateUrl: "./message-dialog.component.html",
  styleUrls: ["./message-dialog.component.less"],
})
export class MessageDialogComponent {
  @Input() title = "";
  @Input() infoMessages: InfoMessage[] = [];

  constructor(private modal: NzModalRef) {}

  handleOk(): void {
    this.modal.destroy();
  }
  handleCancel() {
    this.modal.destroy();
  }
}

/**
 * @description Popup a dialog
 * @param modalService Instance of NzModalService,
 * @param title Title of the dialog,
 * @param msgs Message table,
 * @param buttons Buttons in footer
 */
export function popupDialog(
  modalService: NzModalService,
  title: string,
  msgs: InfoMessage[],
  buttons: MessageDialogButtonEnum = MessageDialogButtonEnum.onlyok
) {
  let footer: any = [];
  switch (buttons) {
    case MessageDialogButtonEnum.okcancel:
      footer = [
        {
          label: "OK",
          onClick: (componentInstance: any) => componentInstance!.handleOk(),
        },
        {
          label: "Cancel",
          onClick: (componentInstance: any) =>
            componentInstance!.handleCancel(),
        },
      ];
      break;

    case MessageDialogButtonEnum.onlyok:
    default:
      footer = [
        {
          label: "OK",
          onClick: (componentInstance: any) => componentInstance!.handleOk(),
        },
      ];
      break;
  }
  const modal = modalService.create({
    nzTitle: title,
    nzContent: MessageDialogComponent,
    nzComponentParams: {
      title,
      infoMessages: msgs,
    },
    nzClosable: true,
    nzMaskClosable: true,
    nzFooter: footer,
  });

  modal.afterOpen.subscribe(() => {
    // console.log('[afterOpen] emitted!');
  });

  // Return a result when closed
  modal.afterClose.subscribe((result) => {
    // console.log('[afterClose] The result is:', result);
  });

  // // delay until modal instance created
  // setTimeout(() => {
  //   const instance = modal.getContentComponent();
  //   instance.subtitle = 'sub title is changed';
  // }, 2000);
}
