import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ControlCenterComponent } from './control-center.component';
import { ControlCenterHierarchyComponent } from './control-center-hierarchy/control-center-hierarchy.component';

const routes: Routes = [
  { path: '', component: ControlCenterComponent },
  { path: 'hierarchy', component: ControlCenterHierarchyComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ControlCenterRoutingModule { }
