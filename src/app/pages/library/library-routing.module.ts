import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: '/book' },
  { path: 'config', loadChildren: () => import('./config/config.module').then(m => m.ConfigModule)},
  { path: 'book', loadChildren: () => import('./book/book.module').then(m => m.BookModule)},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LibraryRoutingModule { }
