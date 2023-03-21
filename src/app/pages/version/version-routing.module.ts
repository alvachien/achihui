import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { VersionComponent } from './version.component';

const routes: Routes = [{ path: '', component: VersionComponent }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class VersionRoutingModule {}
