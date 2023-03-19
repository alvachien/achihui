import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { NormalEventRoutingModule } from "./normal-event-routing.module";
import { NormalEventListComponent } from "./normal-event-list/normal-event-list.component";
import { NormalEventDetailComponent } from "./normal-event-detail/normal-event-detail.component";
import { EventUIModule } from "../event-ui.module";
import { TranslocoModule } from "@ngneat/transloco";

@NgModule({
  declarations: [NormalEventListComponent, NormalEventDetailComponent],
  imports: [
    CommonModule,
    EventUIModule,
    TranslocoModule,
    NormalEventRoutingModule,
  ],
})
export class NormalEventModule {}
