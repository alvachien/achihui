import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceCurrencyComponent } from './finance-currency.component';

describe('FinanceCurrencyComponent', () => {
  let component: FinanceCurrencyComponent;
  let fixture: ComponentFixture<FinanceCurrencyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinanceCurrencyComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceCurrencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
