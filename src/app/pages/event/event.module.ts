import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslocoModule } from "@ngneat/transloco";

import { EventRoutingModule } from "./event-routing.module";
import { EventComponent } from "./event.component";
import { OverviewComponent } from "./overview/overview.component";
import { SearchComponent } from "./search/search.component";
import { EventUIModule } from "./event-ui.module";

@NgModule({
  declarations: [EventComponent, OverviewComponent, SearchComponent],
  imports: [CommonModule, TranslocoModule, EventUIModule, EventRoutingModule],
})
export class EventModule {}
