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
            data: {animation: 'ListPage'},
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
            data: {animation: 'ListPage'},
          },
          {
            path: 'create',
            component: PersonDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'display/:id',
            component: PersonDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'edit/:id',
            component: PersonDetailComponent,
            data: {animation: 'DetailPage'},
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
            data: {animation: 'ListPage'},
          },
          {
            path: 'create',
            component: BookDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'display/:id',
            component: BookDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'edit/:id',
            component: BookDetailComponent,
            data: {animation: 'DetailPage'},
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
            data: {animation: 'ListPage'},
          },
          {
            path: 'create',
            component: MovieGenreDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'display/:id',
            component: MovieGenreDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'edit/:id',
            component: MovieGenreDetailComponent,
            data: {animation: 'DetailPage'},
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
            data: {animation: 'ListPage'},
          },
          {
            path: 'create',
            component: MovieDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'display/:id',
            component: MovieDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'edit/:id',
            component: MovieDetailComponent,
            data: {animation: 'DetailPage'},
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
            data: {animation: 'ListPage'},
          },
          {
            path: 'create',
            component: LocationDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'display/:id',
            component: LocationDetailComponent,
            data: {animation: 'DetailPage'},
          },
          {
            path: 'edit/:id',
            component: LocationDetailComponent,
            data: {animation: 'DetailPage'},
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
