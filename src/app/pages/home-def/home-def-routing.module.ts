import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeDefListComponent } from './home-def-list';
import { HomeDefDetailComponent } from './home-def-detail';

const routes: Routes = [
  { path: '', component: HomeDefListComponent },
  { path: 'create', component: HomeDefDetailComponent },
  { path: 'display/:id', component: HomeDefDetailComponent },
  { path: 'edit/:id', component: HomeDefDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeDefRoutingModule { }
