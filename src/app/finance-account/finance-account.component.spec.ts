import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceAccountComponent } from './finance-account.component';

describe('FinanceAccountComponent', () => {
  let component: FinanceAccountComponent;
  let fixture: ComponentFixture<FinanceAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinanceAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
