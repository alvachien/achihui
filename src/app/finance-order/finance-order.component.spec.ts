import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceOrderComponent } from './finance-order.component';

describe('FinanceOrderComponent', () => {
  let component: FinanceOrderComponent;
  let fixture: ComponentFixture<FinanceOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinanceOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
