import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FinanceUIModule } from "../finance-ui.module";
import { TranslocoModule } from "@ngneat/transloco";
import { ReusableComponentsModule } from "../../reusable-components/reusable-components.module";

import { DocumentItemSearchRoutingModule } from "../document-item-search/document-item-search-routing.module";
import { DocumentItemSearchComponent } from "./document-item-search.component";
import { DocumentItemViewModule } from "../document-item-view/document-item-view.module";

@NgModule({
  declarations: [DocumentItemSearchComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    FinanceUIModule,
    TranslocoModule,
    DocumentItemViewModule,
    DocumentItemSearchRoutingModule,
    ReusableComponentsModule,
  ],
  exports: [DocumentItemSearchComponent],
})
export class DocumentItemSearchModule {}
