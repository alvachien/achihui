import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationRoutingModule } from './organization-routing.module';
import { OrganizationListComponent } from './organization-list/organization-list.component';
import { OrganizationDetailComponent } from './organization-detail/organization-detail.component';


@NgModule({
  declarations: [
    OrganizationListComponent,
    OrganizationDetailComponent
  ],
  imports: [
    CommonModule,
    OrganizationRoutingModule
  ]
})
export class OrganizationModule { }
