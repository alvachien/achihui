import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountExtraLoanComponent } from './account-extra-loan.component';

describe('AccountExtraLoanComponent', () => {
  let component: AccountExtraLoanComponent;
  let fixture: ComponentFixture<AccountExtraLoanComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountExtraLoanComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountExtraLoanComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
