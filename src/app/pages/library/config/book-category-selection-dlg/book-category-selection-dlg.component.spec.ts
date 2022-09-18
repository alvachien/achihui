import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookCategorySelectionDlgComponent } from './book-category-selection-dlg.component';

describe('BookCategorySelectionDlgComponent', () => {
  let component: BookCategorySelectionDlgComponent;
  let fixture: ComponentFixture<BookCategorySelectionDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BookCategorySelectionDlgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookCategorySelectionDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
