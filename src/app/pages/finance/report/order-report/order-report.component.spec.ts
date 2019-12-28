import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgZorroAntdModule, } from 'ng-zorro-antd';

import { OrderReportComponent } from './order-report.component';

describe('OrderReportComponent', () => {
  let component: OrderReportComponent;
  let fixture: ComponentFixture<OrderReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgZorroAntdModule,
      ],
      declarations: [
        OrderReportComponent,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderReportComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
