import {
  waitForAsync,
  ComponentFixture,
  TestBed,
  fakeAsync,
  tick,
  flush,
  discardPeriodicTasks,
} from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, BehaviorSubject } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { Router, UrlSegment, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NzResizableModule } from 'ng-zorro-antd/resizable';
import { NzCodeEditorModule } from 'ng-zorro-antd/code-editor';
import { MarkdownModule, KatexOptions } from 'ngx-markdown';
import { UIMode } from 'actslib';

import { BlogUIModule } from '../../blog-ui.module';
import { getTranslocoModule, FakeDataHelper, ActivatedRouteUrlStub, asyncData } from '../../../../../testing';
import { PostDetailComponent } from './post-detail.component';
import { MarkdownEditorComponent } from '../../../reusable-components/markdown-editor';
import { AuthService, UIStatusService, BlogOdataService } from '../../../../services';
import { UserAuthInfo } from '../../../../model';

describe('PostDetailComponent', () => {
  let component: PostDetailComponent;
  let fixture: ComponentFixture<PostDetailComponent>;
  const authServiceStub: Partial<AuthService> = {};
  let fakeData: FakeDataHelper;
  let storageService: any;
  let readPostSpy: any;
  let fetchAllCollectionsSpy: any;
  let activatedRouteStub: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildBlogCollection();
    fakeData.buildBlogPost();

    storageService = jasmine.createSpyObj('BlogOdataService', ['readPost', 'fetchAllCollections']);
    readPostSpy = storageService.readPost.and.returnValue(of({}));
    fetchAllCollectionsSpy = storageService.fetchAllCollections.and.returnValue(of([]));

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(waitForAsync(() => {
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        getTranslocoModule(),
        FormsModule,
        BlogUIModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        RouterTestingModule,
        BrowserDynamicTestingModule,
        NzResizableModule,
        NzCodeEditorModule,
        MarkdownModule.forRoot(),
      ],
      declarations: [MarkdownEditorComponent, PostDetailComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: BlogOdataService, useValue: storageService },
        NzModalService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostDetailComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('create mode', () => {
    beforeEach(() => {
      fetchAllCollectionsSpy.and.returnValue(asyncData(fakeData.blogCollection));
    });

    it('create mode init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.uiMode).toEqual(UIMode.Create);
      expect(component.listOfCollection.length).toEqual(fakeData.blogCollection.length);

      discardPeriodicTasks();
      flush();
    }));
  });
});
