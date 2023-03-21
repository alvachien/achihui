import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FinanceUIModule } from '../finance-ui.module';
import { TranslocoModule } from '@ngneat/transloco';

import { OrderRoutingModule } from './order-routing.module';
import { OrderComponent } from './order.component';
import { OrderListComponent } from './order-list/order-list.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { DocumentItemViewModule } from '../document-item-view/document-item-view.module';

@NgModule({
  declarations: [OrderComponent, OrderListComponent, OrderDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FinanceUIModule,
    OrderRoutingModule,
    TranslocoModule,
    DocumentItemViewModule,
  ],
})
export class OrderModule {}
