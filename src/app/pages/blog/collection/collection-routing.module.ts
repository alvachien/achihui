import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { CollectionListComponent } from "./collection-list";
import { CollectionDetailComponent } from "./collection-detail";

const routes: Routes = [
  { path: "", component: CollectionListComponent },
  { path: "list", component: CollectionListComponent },
  { path: "create", component: CollectionDetailComponent },
  { path: "display/:id", component: CollectionDetailComponent },
  { path: "edit/:id", component: CollectionDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CollectionRoutingModule {}
