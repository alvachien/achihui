import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookSetDetailComponent } from './book-set-detail.component';

describe('BookSetDetailComponent', () => {
  let component: BookSetDetailComponent;
  let fixture: ComponentFixture<BookSetDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookSetDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookSetDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
