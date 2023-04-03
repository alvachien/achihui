import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentItemInsightComponent } from './document-item-insight.component';

const routes: Routes = [
  { path: '', component: DocumentItemInsightComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentItemInsightRoutingModule {}
