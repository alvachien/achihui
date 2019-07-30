import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DocumentListComponent } from './document-list';
import { DocumentDetailComponent } from './document-detail';

const routes: Routes = [
  { path: '', component: DocumentListComponent },
  { path: 'create', component: DocumentDetailComponent },
  { path: 'edit', component: DocumentDetailComponent },
  { path: 'display', component: DocumentDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentRoutingModule { }
