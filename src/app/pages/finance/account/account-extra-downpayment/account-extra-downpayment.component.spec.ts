import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountExtraDownpaymentComponent } from './account-extra-downpayment.component';

describe('AccountExtraDownpaymentComponent', () => {
  let component: AccountExtraDownpaymentComponent;
  let fixture: ComponentFixture<AccountExtraDownpaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountExtraDownpaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountExtraDownpaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
