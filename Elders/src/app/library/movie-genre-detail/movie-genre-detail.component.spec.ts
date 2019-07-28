import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { HttpLoaderTestFactory } from '../../../testing';
import { MovieGenreDetailComponent } from './movie-genre-detail.component';

describe('MovieGenreDetailComponent', () => {
  let component: MovieGenreDetailComponent;
  let fixture: ComponentFixture<MovieGenreDetailComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        HttpClientTestingModule,
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
        MovieGenreDetailComponent,
      ],
      providers: [
        TranslateService,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieGenreDetailComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
