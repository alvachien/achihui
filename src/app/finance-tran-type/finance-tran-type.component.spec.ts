import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceTranTypeComponent } from './finance-tran-type.component';

describe('FinanceTranTypeComponent', () => {
  let component: FinanceTranTypeComponent;
  let fixture: ComponentFixture<FinanceTranTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinanceTranTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceTranTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
