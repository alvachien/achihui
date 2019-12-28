import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { BehaviorSubject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

import { ControlCenterListComponent } from './control-center-list.component';
import { getTranslocoModule } from '../../../../../testing';
import { AuthService, UIStatusService, } from '../../../../services';
import { UserAuthInfo } from '../../../../model';

describe('ControlCenterListComponent', () => {
  let component: ControlCenterListComponent;
  let fixture: ComponentFixture<ControlCenterListComponent>;
  const authServiceStub: Partial<AuthService> = {};
  authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  const uiServiceStub: Partial<UIStatusService> = {};
  uiServiceStub.getUILabel = (le: any) => { return ''; };
  const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);

  beforeEach(async(() => {

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        NgZorroAntdModule,
        getTranslocoModule(),
      ],
      declarations: [ ControlCenterListComponent ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: Router, useValue: routerSpy },
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
