import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ControlCenterComponent } from './control-center.component';
import { ControlCenterHierarchyComponent } from './control-center-hierarchy';
import { ControlCenterListComponent } from './control-center-list';
import { ControlCenterDetailComponent } from './control-center-detail';

const routes: Routes = [
  { path: '', component: ControlCenterHierarchyComponent },
  { path: 'hierarchy', component: ControlCenterHierarchyComponent },
  { path: 'list', component: ControlCenterListComponent },
  { path: 'create', component: ControlCenterDetailComponent },
  { path: 'display/:id', component: ControlCenterDetailComponent },
  { path: 'edit/:id', component: ControlCenterDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ControlCenterRoutingModule {}
