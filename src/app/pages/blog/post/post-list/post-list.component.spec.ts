import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, BehaviorSubject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';

import { getTranslocoModule, FakeDataHelper } from '../../../../../testing';
import { PostListComponent } from './post-list.component';
import { AuthService, UIStatusService, BlogOdataService, } from '../../../../services';
import { UserAuthInfo } from '../../../../model';

describe('PostListComponent', () => {
  let component: PostListComponent;
  let fixture: ComponentFixture<PostListComponent>;
  const authServiceStub: Partial<AuthService> = {};
  let fakeData: FakeDataHelper;
  let storageService: any;
  let fetchAllPostsSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    storageService = jasmine.createSpyObj('BlogOdataService', [
      'fetchAllPosts',
    ]);
    fetchAllPostsSpy = storageService.fetchAllPosts.and.returnValue(of([]));

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgZorroAntdModule,
        getTranslocoModule(),
        RouterTestingModule,
      ],
      declarations: [
        PostListComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        { provide: BlogOdataService, useValue: storageService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PostListComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
