import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ObjectRoutingModule } from './object-routing.module';
import { ObjectListComponent } from './object-list/object-list.component';
import { ObjectHierarchyComponent } from './object-hierarchy/object-hierarchy.component';
import { ObjectDetailComponent } from './object-detail/object-detail.component';


@NgModule({
  declarations: [ObjectListComponent, ObjectHierarchyComponent, ObjectDetailComponent],
  imports: [
    CommonModule,
    ObjectRoutingModule
  ]
})
export class ObjectModule { }
