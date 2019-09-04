import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ControlCenterRoutingModule } from './control-center-routing.module';
import { ControlCenterComponent } from './control-center.component';
import { ControlCenterListComponent } from './control-center-list/control-center-list.component';
import { ControlCenterDetailComponent } from './control-center-detail/control-center-detail.component';
import { ControlCenterHierarchyComponent } from './control-center-hierarchy/control-center-hierarchy.component';


@NgModule({
  declarations: [ControlCenterComponent, ControlCenterListComponent, ControlCenterDetailComponent, ControlCenterHierarchyComponent],
  imports: [
    CommonModule,
    ControlCenterRoutingModule
  ]
})
export class ControlCenterModule { }
