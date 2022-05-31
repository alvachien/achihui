import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatementOfIncomeExpenseMonthOnMonthComponent } from './statement-of-income-expense-month-on-month.component';

xdescribe('StatementOfIncomeExpenseMonthOnMonthComponent', () => {
  let component: StatementOfIncomeExpenseMonthOnMonthComponent;
  let fixture: ComponentFixture<StatementOfIncomeExpenseMonthOnMonthComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatementOfIncomeExpenseMonthOnMonthComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatementOfIncomeExpenseMonthOnMonthComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
