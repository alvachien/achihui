import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigRoutingModule } from './config-routing.module';
import { PersonRoleListComponent } from './person-role-list/person-role-list.component';
import { OrganizationTypeListComponent } from './organization-type-list/organization-type-list.component';
import { BookCategoryListComponent } from './book-category-list/book-category-list.component';


@NgModule({
  declarations: [
    PersonRoleListComponent,
    OrganizationTypeListComponent,
    BookCategoryListComponent
  ],
  imports: [
    CommonModule,
    ConfigRoutingModule,
  ]
})
export class ConfigModule { }
