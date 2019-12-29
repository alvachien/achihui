import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { BehaviorSubject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

import { ControlCenterHierarchyComponent } from './control-center-hierarchy.component';
import { getTranslocoModule, RouterLinkDirectiveStub } from '../../../../../testing';
import { AuthService, UIStatusService, } from '../../../../services';
import { UserAuthInfo } from '../../../../model';

describe('ControlCenterHierarchyComponent', () => {
  let component: ControlCenterHierarchyComponent;
  let fixture: ComponentFixture<ControlCenterHierarchyComponent>;

  beforeEach(async(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const uiServiceStub: Partial<UIStatusService> = {};
    uiServiceStub.getUILabel = (le: any) => { return ''; };
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
  
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgZorroAntdModule,
        getTranslocoModule(),
        RouterTestingModule,
      ],
      declarations: [
        ControlCenterHierarchyComponent,
        RouterLinkDirectiveStub,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
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
