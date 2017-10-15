import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BookSetListComponent } from './book-set-list.component';

describe('BookSetListComponent', () => {
  let component: BookSetListComponent;
  let fixture: ComponentFixture<BookSetListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BookSetListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BookSetListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
