import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BlogUIModule } from '../blog-ui.module';
import { TranslocoModule } from '@ngneat/transloco';

import { PostRoutingModule } from './post-routing.module';
import { PostListComponent } from './post-list';
import { PostDetailComponent } from './post-detail';


@NgModule({
  declarations: [
    PostListComponent,
    PostDetailComponent,
  ],
  imports: [
    CommonModule,
    PostRoutingModule,
    BlogUIModule,
    TranslocoModule,
  ]
})
export class PostModule { }
