import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, BehaviorSubject } from 'rxjs';
import { Router, UrlSegment, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NzResizableModule } from 'ng-zorro-antd/resizable';
import { NzCodeEditorModule } from 'ng-zorro-antd/code-editor';
import { MarkdownModule } from 'ngx-markdown';

import { getTranslocoModule, FakeDataHelper, ActivatedRouteUrlStub } from '../../../../../testing';
import { PostDetailComponent } from './post-detail.component';
import { MarkdownEditorComponent } from '../../../reusable-components/markdown-editor';
import { AuthService, UIStatusService, BlogOdataService, } from '../../../../services';
import { UserAuthInfo } from '../../../../model';

describe('PostDetailComponent', () => {
  let component: PostDetailComponent;
  let fixture: ComponentFixture<PostDetailComponent>;
  const authServiceStub: Partial<AuthService> = {};
  let fakeData: FakeDataHelper;
  let storageService: any;
  let readPostSpy: any;
  let activatedRouteStub: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    storageService = jasmine.createSpyObj('BlogOdataService', [
      'readPost',
    ]);
    readPostSpy = storageService.readPost.and.returnValue(of([]));

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(async(() => {
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgZorroAntdModule,
        getTranslocoModule(),
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        RouterTestingModule,
        BrowserDynamicTestingModule,
        NzResizableModule,
        NzCodeEditorModule,
        MarkdownModule.forRoot(),
      ],
      declarations: [
        MarkdownEditorComponent,
        PostDetailComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: BlogOdataService, useValue: storageService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostDetailComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
