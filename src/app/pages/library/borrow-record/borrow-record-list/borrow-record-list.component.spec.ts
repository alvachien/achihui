import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorrowRecordListComponent } from './borrow-record-list.component';

xdescribe('BorrowRecordListComponent', () => {
  let component: BorrowRecordListComponent;
  let fixture: ComponentFixture<BorrowRecordListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BorrowRecordListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BorrowRecordListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
