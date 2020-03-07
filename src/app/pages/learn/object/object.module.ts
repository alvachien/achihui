import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LearnUIModule } from '../learn-ui.module';
import { TranslocoModule } from '@ngneat/transloco';

import { ObjectRoutingModule } from './object-routing.module';
import { ObjectListComponent } from './object-list/object-list.component';
import { ObjectHierarchyComponent } from './object-hierarchy/object-hierarchy.component';
import { ObjectDetailComponent } from './object-detail/object-detail.component';


@NgModule({
  declarations: [
    ObjectListComponent,
    ObjectHierarchyComponent,
    ObjectDetailComponent,
  ],
  imports: [
    CommonModule,
    ObjectRoutingModule,
    LearnUIModule,
    TranslocoModule,
  ]
})
export class ObjectModule { }
