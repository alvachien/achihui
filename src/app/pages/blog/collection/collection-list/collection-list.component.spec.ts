import { async, ComponentFixture, TestBed, fakeAsync, tick, discardPeriodicTasks, flush, inject } from '@angular/core/testing';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, BehaviorSubject } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { getTranslocoModule, FakeDataHelper, asyncData, asyncError } from '../../../../../testing';
import { CollectionListComponent } from './collection-list.component';
import { AuthService, UIStatusService, BlogOdataService, } from '../../../../services';
import { UserAuthInfo } from '../../../../model';
import { Router } from '@angular/router';
import { OverlayContainer } from '@angular/cdk/overlay';

describe('CollectionListComponent', () => {
  let component: CollectionListComponent;
  let fixture: ComponentFixture<CollectionListComponent>;
  const authServiceStub: Partial<AuthService> = {};
  let fakeData: FakeDataHelper;
  let storageService: any;
  let fetchAllCollectionsSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildBlogCollection();

    storageService = jasmine.createSpyObj('BlogOdataService', [
      'fetchAllCollections',
    ]);
    fetchAllCollectionsSpy = storageService.fetchAllCollections.and.returnValue(of([]));

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        NgZorroAntdModule,
        getTranslocoModule(),
        NoopAnimationsModule,
        RouterTestingModule,
      ],
      declarations: [
        CollectionListComponent,
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

    it('should show data after OnInit', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.dataSet.length).toBeGreaterThan(0);
      expect(component.dataSet.length).toEqual(fakeData.blogCollection.length);

      discardPeriodicTasks();
      flush();
    }));

    it('shall navigate to display collection', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');

      // Display
      component.onDisplay(fakeData.blogCollection[0].id);
      expect(routerstub.navigate).toHaveBeenCalledWith(['/blog/collection/display/' + fakeData.blogCollection[0].id.toString()]);

      discardPeriodicTasks();
      flush();
    }));

    it('shall navigate to edit collection', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      tick(); // Complete the observables in ngOnInit
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');

      // Display
      component.onEdit(fakeData.blogCollection[0].id);
      expect(routerstub.navigate).toHaveBeenCalledWith(['/blog/collection/edit/' + fakeData.blogCollection[0].id.toString()]);

      discardPeriodicTasks();
      flush();
    }));
  });

  describe('3. shall display error dialog for exception', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllCollectionsSpy.and.returnValue(asyncData(fakeData.blogCollection));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when Service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllCollectionsSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
      flush();

      // OK button
      const closeBtn  = overlayContainerElement.querySelector('.ant-modal-close') as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);

      flush();
    }));
  });
});
