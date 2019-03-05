import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { HttpLoaderTestFactory } from '../../../testing';
import { MovieGenreListComponent } from './movie-genre-list.component';
import { LibraryStorageService } from 'app/services';

describe('MovieGenreListComponent', () => {
  let component: MovieGenreListComponent;
  let fixture: ComponentFixture<MovieGenreListComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;

  beforeEach(async(() => {
    const stgservice: any = jasmine.createSpyObj('LibraryStorageService', ['fetchAllMovieGenres']);
    const fetchAllMovieGenresSpy: any = stgservice.fetchAllMovieGenres.and.returnValue( of([]) );

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient],
          },
        }),
      ],
      declarations: [
        MovieGenreListComponent,
      ],
      providers: [
        TranslateService,
        { provide: LibraryStorageService, useValue: stgservice },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieGenreListComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
