import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';

import { BlogRoutingModule } from './blog-routing.module';
import { BlogUIModule } from './blog-ui.module';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    BlogUIModule,
    TranslocoModule,
    BlogRoutingModule
  ]
})
export class BlogModule { }
