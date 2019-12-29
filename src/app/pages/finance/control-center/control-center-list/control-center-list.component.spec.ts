import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { BehaviorSubject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

import { ControlCenterListComponent } from './control-center-list.component';
import { getTranslocoModule } from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService } from '../../../../services';
import { UserAuthInfo } from '../../../../model';

describe('ControlCenterListComponent', () => {
  let component: ControlCenterListComponent;
  let fixture: ComponentFixture<ControlCenterListComponent>;

  beforeEach(async(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const uiServiceStub: Partial<UIStatusService> = {};
    uiServiceStub.getUILabel = (le: any) => { return ''; };
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    const finServiceStub: Partial<FinanceOdataService> = {};
    // finServiceStub.fetchAllControlCenters = new BehaviorSubject();
  
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgZorroAntdModule,
        getTranslocoModule(),
        RouterTestingModule,
      ],
      declarations: [
        ControlCenterListComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: FinanceOdataService, useValue: finServiceStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ControlCenterListComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
