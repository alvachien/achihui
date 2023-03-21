import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OrganizationRoutingModule } from './organization-routing.module';
import { OrganizationListComponent } from './organization-list';
import { OrganizationDetailComponent } from './organization-detail';
import { LibraryUIModule } from '../library-ui.module';
import { TranslocoModule } from '@ngneat/transloco';
import { OrganizationSelectionDlgComponent } from './organization-selection-dlg/organization-selection-dlg.component';

@NgModule({
  declarations: [OrganizationListComponent, OrganizationDetailComponent, OrganizationSelectionDlgComponent],
  imports: [CommonModule, LibraryUIModule, TranslocoModule, OrganizationRoutingModule],
})
export class OrganizationModule {}
