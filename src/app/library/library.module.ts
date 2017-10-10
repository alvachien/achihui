import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE_PROVIDER, MAT_DATE_LOCALE } from '@angular/material';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { MATERIAL_COMPATIBILITY_MODE } from '@angular/material';

import { UIDependModule } from '../uidepend.module';
import { TranslateModule } from '@ngx-translate/core';
import { MD_MOMENT_DATE_FORMATS, MomentDateAdapter } from '../utility';

import { LibraryComponent } from './library.component';
import { BookComponent } from './book/book.component';
import { BookDetailComponent } from './book-detail/book-detail.component';
import { BookSetComponent } from './book-set/book-set.component';
import { BookSetDetailComponent } from './book-set-detail/book-set-detail.component';
import { MovieComponent } from './movie/movie.component';
import { MovieDetailComponent } from './movie-detail/movie-detail.component';
import { PersonComponent } from './person/person.component';
import { PersonListComponent } from './person-list/person-list.component';
import { PersonDetailComponent } from './person-detail/person-detail.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
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
    PersonDetailComponent
  ],
  providers: [
    MAT_DATE_LOCALE_PROVIDER,
    { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
    { provide: MAT_DATE_FORMATS, useValue: MD_MOMENT_DATE_FORMATS },
    { provide: MATERIAL_COMPATIBILITY_MODE, useValue: true },
  ],
})
export class LibraryModule { }
