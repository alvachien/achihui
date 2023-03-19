import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { FatalErrorComponent } from "./fatal-error.component";

const routes: Routes = [{ path: "", component: FatalErrorComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FatalErrorRoutingModule {}
