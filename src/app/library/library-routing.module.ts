import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LibraryComponent } from './library.component';
import { BookComponent } from './book';
import { BookListComponent } from './book-list';
import { BookDetailComponent } from './book-detail';
import { BookSetComponent } from './book-set/';
import { BookSetListComponent } from './book-set-list';
import { BookSetDetailComponent } from './book-set-detail/';
import { MovieComponent } from './movie/';
import { MovieListComponent } from './movie-list';
import { MovieDetailComponent } from './movie-detail';
import { PersonComponent } from './person';
import { PersonListComponent } from './person-list';
import { PersonDetailComponent } from './person-detail';
import { BookCategoryComponent } from './book-category';
import { BookCategoryListComponent } from './book-category-list';
import { MovieGenreComponent } from './movie-genre';
import { MovieGenreListComponent } from './movie-genre-list';
import { MovieGenreDetailComponent } from './movie-genre-detail';
import { LocationComponent } from './location';
import { LocationListComponent } from './location-list';
import { LocationDetailComponent } from './location-detail';

const routes: Routes = [
  {
    path: '',
    component: LibraryComponent,
    children: [
      {
        path: 'bookcategory',
        component: BookCategoryComponent,
        children: [
          {
            path: '',
            component: BookCategoryListComponent,
          },
        ],
      },
      {
        path: 'person',
        component: PersonComponent,
        children: [
          {
            path: '',
            component: PersonListComponent,
          },
          {
            path: 'create',
            component: PersonDetailComponent,
          },
          {
            path: 'display/:id',
            component: PersonDetailComponent,
          },
          {
            path: 'edit/:id',
            component: PersonDetailComponent,
          },
        ],
      },
      {
        path: 'book',
        component: BookComponent,
        children: [
          {
            path: '',
            component: BookListComponent,
          },
          {
            path: 'create',
            component: BookDetailComponent,
          },
          {
            path: 'display/:id',
            component: BookDetailComponent,
          },
          {
            path: 'edit/:id',
            component: BookDetailComponent,
          },
        ],
      },
      {
        path: 'moviegenre',
        component: MovieGenreComponent,
        children: [
          {
            path: '',
            component: MovieGenreListComponent,
          },
          {
            path: 'create',
            component: MovieGenreDetailComponent,
          },
          {
            path: 'display/:id',
            component: MovieGenreDetailComponent,
          },
          {
            path: 'edit/:id',
            component: MovieGenreDetailComponent,
          },
        ],
      },
      {
        path: 'movie',
        component: MovieComponent,
        children: [
          {
            path: '',
            component: MovieListComponent,
          },
          {
            path: 'create',
            component: MovieDetailComponent,
          },
          {
            path: 'display/:id',
            component: MovieDetailComponent,
          },
          {
            path: 'edit/:id',
            component: MovieDetailComponent,
          },
        ],
      },
      {
        path: 'location',
        component: LocationComponent,
        children: [
          {
            path: '',
            component: LocationListComponent,
          },
          {
            path: 'create',
            component: LocationDetailComponent,
          },
          {
            path: 'display/:id',
            component: LocationDetailComponent,
          },
          {
            path: 'edit/:id',
            component: LocationDetailComponent,
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LibraryRoutingModule { }
