import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { UserDetailComponent } from "./user-detail";

const routes: Routes = [{ path: "", component: UserDetailComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserDetailRoutingModule {}
