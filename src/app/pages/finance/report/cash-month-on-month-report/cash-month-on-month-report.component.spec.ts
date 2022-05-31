import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashMonthOnMonthReportComponent } from './cash-month-on-month-report.component';

xdescribe('CashMonthOnMonthReportComponent', () => {
  let component: CashMonthOnMonthReportComponent;
  let fixture: ComponentFixture<CashMonthOnMonthReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashMonthOnMonthReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CashMonthOnMonthReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
