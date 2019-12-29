import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { BehaviorSubject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

import { DocumentItemsComponent } from './document-items.component';
import { getTranslocoModule } from '../../../../../testing';
import { AuthService, UIStatusService, } from '../../../../services';
import { UserAuthInfo } from '../../../../model';

describe('DocumentItemsComponent', () => {
  let component: DocumentItemsComponent;
  let fixture: ComponentFixture<DocumentItemsComponent>;

  beforeEach(async(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const uiServiceStub: Partial<UIStatusService> = {};
    uiServiceStub.getUILabel = (le: any) => { return ''; };
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        NgZorroAntdModule,
        getTranslocoModule(),
      ],
      declarations: [ DocumentItemsComponent ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: Router, useValue: routerSpy },
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentItemsComponent);
    component = fixture.componentInstance;
    //fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
