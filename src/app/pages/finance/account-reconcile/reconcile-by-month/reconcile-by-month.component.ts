import { Component } from '@angular/core';
import { AccountReconcileExpect } from 'src/app/model';

@Component({
  selector: 'hih-reconcile-by-month',
  templateUrl: './reconcile-by-month.component.html',
  styleUrls: ['./reconcile-by-month.component.less'],
})
export class ReconcileByMonthComponent {
  currentStep = 0;
  processing = false;
  // Step 0. Select an account
  // Step 1. Expect result
  expectResult = '';
  isFastInputDlgVisible = false;
  listExpectResult: AccountReconcileExpect[] = [];
  fastInputExample = `[{ Month: month, Amount: amount }]
  Example: [{ Month: '2023-01', Amount: 100 }, { Month: '2023-02', Amount: 200 }]`;

  // Step 2. Compare result

  pre(): void {
    this.currentStep -= 1;
  }

  next(): void {
    this.currentStep += 1;
  }

  done(): void {
    console.log('done');
  }

  // Step 0. Select an account

  // Step 1. Expect result
  handleFastInputModalSubmit() {
    // Parse the format and insert into table
    this.isFastInputDlgVisible = false;
  }
  handleFastInputModalCancel() {
    this.isFastInputDlgVisible = false;
  }
  showFastInputModal() {
    this.isFastInputDlgVisible = true;
  }
  onAddExpectResultRow() {
    this.listExpectResult = [
      ...this.listExpectResult,
      new AccountReconcileExpect(),
    ];
  }

  // Step 2. Compare the result

}
