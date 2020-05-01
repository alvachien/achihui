import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserSettingComponent } from './user-setting';

const routes: Routes = [
  { path: 'setting', component: UserSettingComponent },
  { path: 'collection', loadChildren: () => import('./collection/collection.module').then(m => m.CollectionModule) },
  { path: 'post', loadChildren: () => import('./post/post.module').then(m => m.PostModule) },  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogRoutingModule { }
