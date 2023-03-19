import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NzResultModule } from "ng-zorro-antd/result";
import { TranslocoModule } from "@ngneat/transloco";

import { FatalErrorRoutingModule } from "./fatal-error-routing.module";
import { FatalErrorComponent } from "./fatal-error.component";

@NgModule({
  declarations: [FatalErrorComponent],
  imports: [
    CommonModule,
    NzResultModule,
    TranslocoModule,
    FatalErrorRoutingModule,
  ],
})
export class FatalErrorModule {}
