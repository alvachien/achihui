import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { DocumentItemSearchComponent } from "./document-item-search.component";

const routes: Routes = [{ path: "", component: DocumentItemSearchComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DocumentItemSearchRoutingModule {}
