import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { TranslocoModule } from "@ngneat/transloco";
import { NzSpinModule } from "ng-zorro-antd/spin";
import { NzPageHeaderModule } from "ng-zorro-antd/page-header";
import { NzTableModule } from "ng-zorro-antd/table";
import { NzBreadCrumbModule } from "ng-zorro-antd/breadcrumb";
import { NzSwitchModule } from "ng-zorro-antd/switch";

import { LanguageRoutingModule } from "./language-routing.module";
import { LanguageComponent } from "./language.component";

@NgModule({
  declarations: [LanguageComponent],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    LanguageRoutingModule,
    TranslocoModule,
    NzSpinModule,
    NzPageHeaderModule,
    NzTableModule,
    NzBreadCrumbModule,
    NzSwitchModule,
  ],
})
export class LanguageModule {}
