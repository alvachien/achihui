import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgZorroAntdModule, } from 'ng-zorro-antd';

import { ControlCenterReportComponent } from './control-center-report.component';

describe('ControlCenterReportComponent', () => {
  let component: ControlCenterReportComponent;
  let fixture: ComponentFixture<ControlCenterReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgZorroAntdModule
      ],
      declarations: [ ControlCenterReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlCenterReportComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
