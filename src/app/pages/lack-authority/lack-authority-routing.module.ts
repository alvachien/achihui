import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LackAuthorityComponent } from './lack-authority.component';


const routes: Routes = [
  { path: '', component: LackAuthorityComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LackAuthorityRoutingModule { }
