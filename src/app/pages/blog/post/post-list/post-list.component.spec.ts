import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, BehaviorSubject } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { BlogUIModule } from '../../blog-ui.module';
import { createSpyObj, getTranslocoModule, FakeDataHelper, asyncData, asyncError } from '../../../../../testing';
import { PostListComponent } from './post-list.component';
import { AuthService, UIStatusService, BlogOdataService } from '../../../../services';
import { UserAuthInfo } from '../../../../model';
import { Router } from '@angular/router';
import { OverlayContainer } from '@angular/cdk/overlay';
import { SafeAny } from '@common/index';

describe('PostListComponent', () => {
  let component: PostListComponent;
  let fixture: ComponentFixture<PostListComponent>;
  const authServiceStub: Partial<AuthService> = {};
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let fetchAllPostsSpy: SafeAny;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildBlogPost();

    storageService = createSpyObj('BlogOdataService', ['fetchAllPosts']);
    fetchAllPostsSpy = storageService.fetchAllPosts.and.returnValue(of({}));

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NoopAnimationsModule,
        BlogUIModule,
        getTranslocoModule(),
        RouterTestingModule,
        PostListComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        NzModalService,
        { provide: BlogOdataService, useValue: storageService },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PostListComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('2. shall work with data', () => {
    beforeEach(() => {
      fetchAllPostsSpy.and.returnValue(
        asyncData({
          totalCount: 100,
          contentList: fakeData.blogPost,
        }),
      );
    });

    it('should not show data before OnInit', () => {
      expect(component.dataSet.length).toEqual(0);
      expect(component.dataSet.length).toEqual(0);
    });

    it('should show data after OnInit', async () => {
      fixture.detectChanges(); // ngOnInit()
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the observables in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.dataSet.length).toBeGreaterThan(0);
      expect(component.dataSet.length).toEqual(fakeData.blogPost.length);
      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('shall navigate to display post', async () => {
      fixture.detectChanges(); // ngOnInit()
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the observables in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      const routerstub = TestBed.inject(Router);
      vi.spyOn(routerstub, 'navigate');

      // Display
      component.onDisplay(fakeData.blogPost[0].id ?? 0);
      expect(routerstub.navigate).toHaveBeenCalledWith([
        '/blog/post/display/' + (fakeData.blogPost[0].id ?? 0).toString(),
      ]);
      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('shall navigate to edit post', async () => {
      fixture.detectChanges(); // ngOnInit()
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the observables in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      const routerstub = TestBed.inject(Router);
      vi.spyOn(routerstub, 'navigate');

      // Display
      component.onEdit(fakeData.blogPost[0].id ?? 0);
      expect(routerstub.navigate).toHaveBeenCalledWith([
        '/blog/post/edit/' + (fakeData.blogPost[0].id ?? 0).toString(),
      ]);
      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });

  describe('3. shall display error dialog for exception', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllPostsSpy.and.returnValue(asyncData(fakeData.blogPost));
    });

    beforeEach(() => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when Service fails', async () => {
      // tell spy to return an async error observable
      fetchAllPostsSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0)); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });
});
