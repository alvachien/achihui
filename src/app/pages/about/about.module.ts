import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslocoModule } from "@ngneat/transloco";
import { NzDividerModule } from "ng-zorro-antd/divider";

import { AboutRoutingModule } from "./about-routing.module";
import { AboutComponent } from "./about.component";

@NgModule({
  declarations: [AboutComponent],
  imports: [CommonModule, TranslocoModule, AboutRoutingModule, NzDividerModule],
})
export class AboutModule {}
