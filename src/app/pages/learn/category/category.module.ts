import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LearnUIModule } from '../learn-ui.module';
import { TranslocoModule } from '@ngneat/transloco';

import { CategoryRoutingModule } from './category-routing.module';
import { CategoryListComponent } from './category-list/category-list.component';

@NgModule({
  declarations: [
    CategoryListComponent
  ],
  imports: [
    CommonModule,
    CategoryRoutingModule,
    LearnUIModule,
    TranslocoModule,
  ]
})
export class CategoryModule { }
