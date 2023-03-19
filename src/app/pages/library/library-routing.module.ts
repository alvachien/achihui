import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { SearchComponent } from "./search";

const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: "/book" },
  {
    path: "config",
    loadChildren: () =>
      import("./config/config.module").then((m) => m.ConfigModule),
  },
  {
    path: "person",
    loadChildren: () =>
      import("./person/person.module").then((m) => m.PersonModule),
  },
  {
    path: "organization",
    loadChildren: () =>
      import("./organization/organization.module").then(
        (m) => m.OrganizationModule
      ),
  },
  {
    path: "location",
    loadChildren: () =>
      import("./location/location.module").then((m) => m.LocationModule),
  },
  {
    path: "book",
    loadChildren: () => import("./book/book.module").then((m) => m.BookModule),
  },
  {
    path: "borrowrecord",
    loadChildren: () =>
      import("./borrow-record/borrow-record.module").then(
        (m) => m.BorrowRecordModule
      ),
  },
  { path: "search", component: SearchComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LibraryRoutingModule {}
