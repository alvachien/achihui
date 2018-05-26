import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountExtCreditCardComponent } from './account-ext-credit-card.component';

describe('AccountExtCreditCardComponent', () => {
  let component: AccountExtCreditCardComponent;
  let fixture: ComponentFixture<AccountExtCreditCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountExtCreditCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountExtCreditCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});