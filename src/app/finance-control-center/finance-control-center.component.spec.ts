import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceControlCenterComponent } from './finance-control-center.component';

describe('FinanceControlCenterComponent', () => {
  let component: FinanceControlCenterComponent;
  let fixture: ComponentFixture<FinanceControlCenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinanceControlCenterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceControlCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
