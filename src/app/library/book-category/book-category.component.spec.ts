import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookCategoryComponent } from './book-category.component';

describe('BookCategoryComponent', () => {
  let component: BookCategoryComponent;
  let fixture: ComponentFixture<BookCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
