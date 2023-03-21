import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfigRoutingModule } from './config-routing.module';
import { PersonRoleListComponent } from './person-role-list/person-role-list.component';
import { OrganizationTypeListComponent } from './organization-type-list/organization-type-list.component';
import { BookCategoryListComponent } from './book-category-list/book-category-list.component';
import { ConfigComponent } from './config.component';
import { LibraryUIModule } from '../library-ui.module';
import { TranslocoModule } from '@ngneat/transloco';
import { BookCategorySelectionDlgComponent } from './book-category-selection-dlg/book-category-selection-dlg.component';
import { PersonRoleSelectionDlgComponent } from './person-role-selection-dlg/person-role-selection-dlg.component';
import { OrganizationTypeSelectionDlgComponent } from './organization-type-selection-dlg/organization-type-selection-dlg.component';

@NgModule({
  declarations: [
    PersonRoleListComponent,
    OrganizationTypeListComponent,
    BookCategoryListComponent,
    ConfigComponent,
    BookCategorySelectionDlgComponent,
    PersonRoleSelectionDlgComponent,
    OrganizationTypeSelectionDlgComponent,
  ],
  imports: [CommonModule, LibraryUIModule, TranslocoModule, ConfigRoutingModule],
})
export class ConfigModule {}
