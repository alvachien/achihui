import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LocationListComponent } from './location-list';
import { LocationDetailComponent } from './location-detail';

const routes: Routes = [
  { path: '', component: LocationListComponent },
  { path: 'create', component: LocationDetailComponent },
  { path: 'display/:id', component: LocationDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LocationRoutingModule { }
