import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LibraryComponent } from './library.component';
import { BookComponent } from './book/book.component';
import { BookDetailComponent } from './book-detail/book-detail.component';
import { BookSetComponent } from './book-set/book-set.component';
import { BookSetDetailComponent } from './book-set-detail/book-set-detail.component';
import { MovieComponent } from './movie/movie.component';
import { MovieDetailComponent } from './movie-detail/movie-detail.component';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    LibraryComponent, 
    BookComponent, 
    BookDetailComponent, 
    BookSetComponent, 
    BookSetDetailComponent, 
    MovieComponent, 
    MovieDetailComponent
  ]
})
export class LibraryModule { }
