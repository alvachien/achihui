import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FinanceUIModule } from '../finance-ui.module';
import { TranslocoModule } from '@ngneat/transloco';

import { ControlCenterRoutingModule } from './control-center-routing.module';
import { ControlCenterComponent } from './control-center.component';
import { ControlCenterListComponent } from './control-center-list';
import { ControlCenterDetailComponent } from './control-center-detail';
import { ControlCenterHierarchyComponent } from './control-center-hierarchy';
import { DocumentItemViewModule } from '../document-item-view/document-item-view.module';

@NgModule({
  declarations: [
    ControlCenterComponent,
    ControlCenterListComponent,
    ControlCenterDetailComponent,
    ControlCenterHierarchyComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FinanceUIModule,
    ControlCenterRoutingModule,
    TranslocoModule,
    DocumentItemViewModule,
  ]
})
export class ControlCenterModule { }
