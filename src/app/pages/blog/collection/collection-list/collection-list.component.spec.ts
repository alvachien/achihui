import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, BehaviorSubject } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { BlogUIModule } from '../../blog-ui.module';
import { createSpyObj, getTranslocoModule, FakeDataHelper, asyncData, asyncError } from '../../../../../testing';
import { CollectionListComponent } from './collection-list.component';
import { AuthService, UIStatusService, BlogOdataService } from '../../../../services';
import { UserAuthInfo } from '../../../../model';
import { Router } from '@angular/router';
import { OverlayContainer } from '@angular/cdk/overlay';
import { SafeAny } from '@common/index';

describe('CollectionListComponent', () => {
  let component: CollectionListComponent;
  let fixture: ComponentFixture<CollectionListComponent>;
  const authServiceStub: Partial<AuthService> = {};
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let fetchAllCollectionsSpy: SafeAny;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildBlogCollection();

    storageService = createSpyObj('BlogOdataService', ['fetchAllCollections']);
    fetchAllCollectionsSpy = storageService.fetchAllCollections.and.returnValue(of([]));

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        getTranslocoModule(),
        CollectionListComponent,
        NoopAnimationsModule,
        BlogUIModule,
        RouterTestingModule,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        { provide: BlogOdataService, useValue: storageService },
        NzModalService,
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionListComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('2. shall work with data', () => {
    beforeEach(() => {
      fetchAllCollectionsSpy.and.returnValue(asyncData(fakeData.blogCollection));
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
      expect(component.dataSet.length).toEqual(fakeData.blogCollection.length);
      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('shall navigate to display collection', async () => {
      fixture.detectChanges(); // ngOnInit()
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the observables in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      const routerstub = TestBed.inject(Router);
      vi.spyOn(routerstub, 'navigate');

      // Display
      component.onDisplay(fakeData.blogCollection[0].id);
      expect(routerstub.navigate).toHaveBeenCalledWith([
        '/blog/collection/display/' + fakeData.blogCollection[0].id.toString(),
      ]);
      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('shall navigate to edit collection', async () => {
      fixture.detectChanges(); // ngOnInit()
      await new Promise<void>((r) => setTimeout(r, 0)); // Complete the observables in ngOnInit
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      const routerstub = TestBed.inject(Router);
      vi.spyOn(routerstub, 'navigate');

      // Display
      component.onEdit(fakeData.blogCollection[0].id);
      expect(routerstub.navigate).toHaveBeenCalledWith([
        '/blog/collection/edit/' + fakeData.blogCollection[0].id.toString(),
      ]);
      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });

  describe('3. shall display error dialog for exception', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllCollectionsSpy.and.returnValue(asyncData(fakeData.blogCollection));
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
      fetchAllCollectionsSpy.and.returnValue(asyncError<string>('Service failed'));

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
