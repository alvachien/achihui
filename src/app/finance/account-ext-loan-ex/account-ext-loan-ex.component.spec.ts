import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountExtLoanExComponent } from './account-ext-loan-ex.component';

describe('AccountExtLoanExComponent', () => {
  let component: AccountExtLoanExComponent;
  let fixture: ComponentFixture<AccountExtLoanExComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountExtLoanExComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountExtLoanExComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
