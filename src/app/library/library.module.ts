import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE_PROVIDER, MAT_DATE_LOCALE } from '@angular/material';
import { HttpClientModule, HttpClient } from '@angular/common/http';

import { UIDependModule } from '../uidepend.module';
import { TranslateModule } from '@ngx-translate/core';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';

import { LibraryRoutingModule } from './library-routing.module';

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

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    LibraryRoutingModule,
    UIDependModule,
    TranslateModule.forChild(),
  ],
  declarations: [
    LibraryComponent, 
    BookComponent, 
    BookDetailComponent, 
    BookSetComponent, 
    BookSetDetailComponent, 
    MovieComponent, 
    MovieDetailComponent, 
    PersonComponent, 
    PersonListComponent, 
    PersonDetailComponent, 
    BookCategoryComponent, 
    BookCategoryListComponent, 
    MovieGenreComponent, 
    MovieGenreDetailComponent, 
    LocationComponent, 
    LocationListComponent, 
    LocationDetailComponent, 
    BookListComponent, 
    BookSetListComponent, 
    MovieListComponent, 
    MovieGenreListComponent
  ],
  providers: [
    MAT_DATE_LOCALE_PROVIDER,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
  ],
})
export class LibraryModule { }
