import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CashReportComponent } from './cash-report.component';

xdescribe('CashReportComponent', () => {
  let component: CashReportComponent;
  let fixture: ComponentFixture<CashReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CashReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CashReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
