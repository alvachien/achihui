import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ControlCenterReportComponent } from './control-center-report.component';

describe('ControlCenterReportComponent', () => {
  let component: ControlCenterReportComponent;
  let fixture: ComponentFixture<ControlCenterReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ControlCenterReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlCenterReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
