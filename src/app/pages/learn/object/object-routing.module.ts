import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ObjectHierarchyComponent } from'./object-hierarchy';
import { ObjectListComponent } from './object-list';
import { ObjectDetailComponent } from './object-detail';

const routes: Routes = [
  { path: '', component: ObjectListComponent },
  { path: 'hierarchy', component: ObjectHierarchyComponent },
  { path: 'list', component: ObjectListComponent },
  { path: 'create', component: ObjectDetailComponent },
  { path: 'display/:id', component: ObjectDetailComponent },
  { path: 'edit/:id', component: ObjectDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ObjectRoutingModule { }
