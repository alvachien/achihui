import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PostDetailComponent } from './post-detail';
import { PostListComponent } from './post-list';

const routes: Routes = [
  { path: '', component: PostListComponent },
  { path: 'list', component: PostListComponent },
  { path: 'create', component: PostDetailComponent },
  { path: 'display/:id', component: PostDetailComponent },
  { path: 'edit/:id', component: PostDetailComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PostRoutingModule {}
