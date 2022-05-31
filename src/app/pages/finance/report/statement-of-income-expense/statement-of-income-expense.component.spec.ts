import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatementOfIncomeExpenseComponent } from './statement-of-income-expense.component';

xdescribe('StatementOfIncomeExpenseComponent', () => {
  let component: StatementOfIncomeExpenseComponent;
  let fixture: ComponentFixture<StatementOfIncomeExpenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatementOfIncomeExpenseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatementOfIncomeExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
