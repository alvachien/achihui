import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, UrlSegment, ActivatedRoute } from '@angular/router';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { BehaviorSubject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

import { DocumentHeaderComponent } from '../document-header';
import { DocumentItemsComponent } from '../document-items';
import { DocumentDownpaymentCreateComponent } from './document-downpayment-create.component';
import { getTranslocoModule, ActivatedRouteUrlStub } from '../../../../../testing';
import { AuthService, UIStatusService, } from '../../../../services';
import { UserAuthInfo } from '../../../../model';

describe('DocumentDownpaymentCreateComponent', () => {
  let component: DocumentDownpaymentCreateComponent;
  let fixture: ComponentFixture<DocumentDownpaymentCreateComponent>;

  beforeEach(async(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const uiServiceStub: Partial<UIStatusService> = {};
    uiServiceStub.getUILabel = (le: any) => { return ''; };
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    const activatedRouteStub: any = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        NgZorroAntdModule,
        getTranslocoModule(),
      ],
      declarations: [
        DocumentHeaderComponent,
        DocumentItemsComponent,
        DocumentDownpaymentCreateComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        // { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentDownpaymentCreateComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
