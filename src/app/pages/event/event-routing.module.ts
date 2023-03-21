import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OverviewComponent } from './overview';
import { SearchComponent } from './search';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/overview' },
  { path: 'overview', component: OverviewComponent },
  {
    path: 'normal-event',
    loadChildren: () => import('./normal-event/normal-event.module').then((m) => m.NormalEventModule),
  },
  {
    path: 'recur-event',
    loadChildren: () => import('./recur-event/recur-event.module').then((m) => m.RecurEventModule),
  },
  { path: 'search', component: SearchComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EventRoutingModule {}
