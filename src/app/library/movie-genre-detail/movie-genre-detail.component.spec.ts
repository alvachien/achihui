import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MovieGenreDetailComponent } from './movie-genre-detail.component';

describe('MovieGenreDetailComponent', () => {
  let component: MovieGenreDetailComponent;
  let fixture: ComponentFixture<MovieGenreDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MovieGenreDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MovieGenreDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
