import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UrlSegment, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NzResizableModule } from 'ng-zorro-antd/resizable';
import { NzCodeEditorModule } from 'ng-zorro-antd/code-editor';
import { MarkdownModule } from 'ngx-markdown';
import { UIMode } from 'actslib';

import {
  createSpyObj,
  getTranslocoModule,
  FakeDataHelper,
  ActivatedRouteUrlStub,
  asyncData,
} from '../../../../testing';
import { PostDetailComponent } from './post-detail.component';
import { AuthService, UIStatusService, BlogOdataService } from '../../../services';
import { UserAuthInfo } from '../../../model';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

describe('PostDetailComponent', () => {
  let component: PostDetailComponent;
  let fixture: ComponentFixture<PostDetailComponent>;
  const authServiceStub: Partial<AuthService> = {};
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let readPostSpy: SafeAny;
  let fetchAllCollectionsSpy: SafeAny;
  let activatedRouteStub: SafeAny;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildBlogCollection();
    fakeData.buildBlogPost();

    storageService = createSpyObj('BlogOdataService', ['readPost', 'fetchAllCollections']);
    readPostSpy = storageService.readPost.and.returnValue(of({}));
    fetchAllCollectionsSpy = storageService.fetchAllCollections.and.returnValue(of([]));

    authServiceStub.authSubject = signal(new UserAuthInfo());
  });

  beforeEach(async () => {
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);

    TestBed.configureTestingModule({
      imports: [
        PostDetailComponent,
        getTranslocoModule(),
        FormsModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NzResizableModule,
        NzCodeEditorModule,
        MarkdownModule.forRoot(),
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: BlogOdataService, useValue: storageService },
        NzModalService,
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostDetailComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    expect(readPostSpy).not.toHaveBeenCalled();
  });

  describe('create mode', () => {
    beforeEach(() => {
      fetchAllCollectionsSpy.and.returnValue(asyncData(fakeData.blogCollection));
    });

    it('create mode init without error', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.uiMode).toEqual(UIMode.Create);
      expect(component.listOfCollection.length).toEqual(fakeData.blogCollection.length);
      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });
});
