import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookSetComponent } from './book-set.component';

describe('BookSetComponent', () => {
  let component: BookSetComponent;
  let fixture: ComponentFixture<BookSetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookSetComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookSetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
