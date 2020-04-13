import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
  { path: 'collection', loadChildren: () => import('./collection/collection.module').then(m => m.CollectionModule) },
  { path: 'post', loadChildren: () => import('./post/post.module').then(m => m.PostModule) },  
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BlogRoutingModule { }
