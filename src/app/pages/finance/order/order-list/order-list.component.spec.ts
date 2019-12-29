import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { BehaviorSubject } from 'rxjs';

import { OrderListComponent } from './order-list.component';
import { getTranslocoModule } from '../../../../../testing';
import { AuthService, UIStatusService, } from '../../../../services';
import { UserAuthInfo } from '../../../../model';

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;

  beforeEach(async(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const uiServiceStub: Partial<UIStatusService> = {};
    uiServiceStub.getUILabel = (le: any) => { return ''; };
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      declarations: [
        OrderListComponent,
      ],
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        getTranslocoModule(),
        NgZorroAntdModule,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: Router, useValue: routerSpy },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
