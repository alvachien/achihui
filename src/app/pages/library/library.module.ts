import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { LibraryRoutingModule } from "./library-routing.module";
import { LibraryUIModule } from "./library-ui.module";
import { TranslocoModule } from "@ngneat/transloco";
import { LibraryComponent } from "./library.component";
import { SearchComponent } from "./search/search.component";

@NgModule({
  declarations: [LibraryComponent, SearchComponent],
  imports: [
    CommonModule,
    LibraryUIModule,
    TranslocoModule,
    LibraryRoutingModule,
  ],
})
export class LibraryModule {}
