import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeDefRoutingModule } from './home-def-routing.module';
import { HomeDefComponent } from './home-def.component';
import { HomeDefListComponent } from './home-def-list';
import { HomeDefDetailComponent } from './home-def-detail';


@NgModule({
  declarations: [HomeDefComponent, HomeDefListComponent, HomeDefDetailComponent],
  imports: [
    CommonModule,
    HomeDefRoutingModule
  ]
})
export class HomeDefModule { }
