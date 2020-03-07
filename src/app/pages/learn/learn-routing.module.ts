import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LearnComponent } from './learn.component';

const routes: Routes = [
  { path: '', component: LearnComponent },
  { path: 'category', loadChildren: () => import('./category/category.module').then(m => m.CategoryModule) },
  { path: 'object', loadChildren: () => import('./object/object.module').then(m => m.ObjectModule) },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LearnRoutingModule { }
