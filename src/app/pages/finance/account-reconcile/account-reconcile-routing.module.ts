import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ReconcileByMonthComponent } from './reconcile-by-month';

const routes: Routes = [
  { path: 'bymonth', component: ReconcileByMonthComponent },
  { path: 'bymonth/:id', component: ReconcileByMonthComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountReconcileRoutingModule {}
