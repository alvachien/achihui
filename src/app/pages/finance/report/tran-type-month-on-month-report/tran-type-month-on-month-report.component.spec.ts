import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranTypeMonthOnMonthReportComponent } from './tran-type-month-on-month-report.component';

describe('TranTypeMonthOnMonthReportComponent', () => {
  let component: TranTypeMonthOnMonthReportComponent;
  let fixture: ComponentFixture<TranTypeMonthOnMonthReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TranTypeMonthOnMonthReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TranTypeMonthOnMonthReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
