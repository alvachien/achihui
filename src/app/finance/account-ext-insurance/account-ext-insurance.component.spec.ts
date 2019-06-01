import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountExtInsuranceComponent } from './account-ext-insurance.component';

describe('AccountExtInsuranceComponent', () => {
  let component: AccountExtInsuranceComponent;
  let fixture: ComponentFixture<AccountExtInsuranceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountExtInsuranceComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountExtInsuranceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
