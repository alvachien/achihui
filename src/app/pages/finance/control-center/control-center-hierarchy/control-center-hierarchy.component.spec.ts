import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { BehaviorSubject } from 'rxjs';

import { ControlCenterHierarchyComponent } from './control-center-hierarchy.component';
import { getTranslocoModule, RouterLinkDirectiveStub } from '../../../../../testing';
import { AuthService, UIStatusService, } from '../../../../services';
import { UserAuthInfo } from '../../../../model';
import { RouterTestingModule } from '@angular/router/testing';

describe('ControlCenterHierarchyComponent', () => {
  let component: ControlCenterHierarchyComponent;
  let fixture: ComponentFixture<ControlCenterHierarchyComponent>;
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
      declarations: [
        ControlCenterHierarchyComponent,
        RouterLinkDirectiveStub,
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
    fixture = TestBed.createComponent(ControlCenterHierarchyComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
