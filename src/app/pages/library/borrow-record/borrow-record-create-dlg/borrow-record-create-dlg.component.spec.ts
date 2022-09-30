import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BorrowRecordCreateDlgComponent } from './borrow-record-create-dlg.component';

xdescribe('BorrowRecordCreateDlgComponent', () => {
  let component: BorrowRecordCreateDlgComponent;
  let fixture: ComponentFixture<BorrowRecordCreateDlgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BorrowRecordCreateDlgComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BorrowRecordCreateDlgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
