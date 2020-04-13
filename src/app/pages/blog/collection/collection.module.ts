import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogUIModule } from '../blog-ui.module';
import { TranslocoModule } from '@ngneat/transloco';

import { CollectionRoutingModule } from './collection-routing.module';
import { CollectionListComponent } from './collection-list/collection-list.component';
import { CollectionDetailComponent } from './collection-detail/collection-detail.component';


@NgModule({
  declarations: [CollectionListComponent, CollectionDetailComponent],
  imports: [
    CommonModule,
    CollectionRoutingModule,
    BlogUIModule,
    TranslocoModule,
  ]
})
export class CollectionModule { }
