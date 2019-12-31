import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LanguageComponent } from './language.component';

const routes: Routes = [
  { path: '', component: LanguageComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LanguageRoutingModule { }
