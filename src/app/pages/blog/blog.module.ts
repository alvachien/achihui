import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoModule } from '@ngneat/transloco';

import { BlogRoutingModule } from './blog-routing.module';
import { BlogUIModule } from './blog-ui.module';
import { UserSettingComponent } from './user-setting';

@NgModule({
  declarations: [UserSettingComponent],
  imports: [CommonModule, BlogUIModule, TranslocoModule, BlogRoutingModule],
  providers: [],
})
export class BlogModule {}
