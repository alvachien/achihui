import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { RouterTestingModule } from '@angular/router/testing';

import { createSpyObj, getTranslocoModule, FakeDataHelper, asyncData, asyncError } from '../../../../testing';
import { PostListComponent } from './post-list.component';
import { AuthService, UIStatusService, BlogOdataService } from '../../../services';
import { UserAuthInfo } from '../../../model';
import { Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { OverlayContainer } from '@angular/cdk/overlay';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi, withXhr } from '@angular/common/http';

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

    authServiceStub.authSubject = signal(new UserAuthInfo());
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [getTranslocoModule(), PostListComponent, RouterTestingModule],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        NzModalService,
        { provide: BlogOdataService, useValue: storageService },
        provideHttpClient(withXhr(), withInterceptorsFromDi()),
        provideHttpClientTesting(),
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

    it('shall render the post ID as a link to the display page', async () => {
      fixture.detectChanges(); // ngOnInit()
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the observables in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // The ID column links to the display page (book-list pattern)
      const id = fakeData.blogPost[0].id ?? 0;
      const idLink = fixture.debugElement.query(By.css('.id-cell a'));
      expect(idLink).toBeTruthy();
      expect(idLink?.nativeElement.textContent?.trim()).toBe(String(id));
      expect(idLink?.nativeElement.getAttribute('href')).toBe('/blog/post/display/' + id);
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
