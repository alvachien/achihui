import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrganizationListComponent } from './organization-list';
import { OrganizationDetailComponent } from './organization-detail';

const routes: Routes = [  
  { path: '', component: OrganizationListComponent },
  { path: 'create', component: OrganizationDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrganizationRoutingModule { }
