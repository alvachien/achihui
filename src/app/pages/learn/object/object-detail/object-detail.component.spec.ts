import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick, inject, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { BehaviorSubject, of, } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule, } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { MarkdownService, SECURITY_CONTEXT } from 'ngx-markdown';

import { LearnUIModule } from '../../learn-ui.module';
import { getTranslocoModule, FakeDataHelper, asyncData, asyncError,
  ElementClass_DialogContent, ElementClass_DialogCloseButton } from '../../../../../testing';
import { AuthService, UIStatusService, LearnOdataService, } from '../../../../services';
import { UserAuthInfo } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';
import { ObjectDetailComponent } from './object-detail.component';

describe('ObjectDetailComponent', () => {
  let component: ObjectDetailComponent;
  let fixture: ComponentFixture<ObjectDetailComponent>;
  let fakeData: FakeDataHelper;
  let storageService: any;
  let fetchAllCategoriesSpy: any;
  let readObjectSpy: any;
  const authServiceStub: Partial<AuthService> = {};
  const uiServiceStub: Partial<UIStatusService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildLearnCategories();
    fakeData.buildLearnObjects();

    storageService = jasmine.createSpyObj('LearnOdataService', [
      'fetchAllCategories',
      'readObject'
    ]);
    fetchAllCategoriesSpy = storageService.fetchAllCategories.and.returnValue(of([]));
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        LearnUIModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        getTranslocoModule(),
      ],
      declarations: [
        MessageDialogComponent,
        ObjectDetailComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: UIStatusService, useValue: uiServiceStub },
        { provide: LearnOdataService, useValue: storageService },
        NzModalService,
        { provide: SECURITY_CONTEXT, useValue: 1},
        // SECURITY_CONTEXT,
        MarkdownService,
      ]
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [
          MessageDialogComponent,
        ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectDetailComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
