import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { of, BehaviorSubject } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UrlSegment, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { UIMode } from 'actslib';

import { createSpyObj, getTranslocoModule, FakeDataHelper, ActivatedRouteUrlStub } from '../../../../testing';
import { CollectionDetailComponent } from './collection-detail.component';
import { AuthService, UIStatusService, BlogOdataService } from '@services/index';
import { UserAuthInfo } from '@model/index';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('CollectionDetailComponent', () => {
  let component: CollectionDetailComponent;
  let fixture: ComponentFixture<CollectionDetailComponent>;
  const authServiceStub: Partial<AuthService> = {};
  let fakeData: FakeDataHelper;
  let storageService: SafeAny;
  let readCollectionSpy: SafeAny;
  let createCollectionSpy: SafeAny;
  let activatedRouteStub: SafeAny;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    storageService = createSpyObj('BlogOdataService', ['readCollection', 'createCollection']);
    readCollectionSpy = storageService.readCollection.and.returnValue(of([]));
    createCollectionSpy = storageService.createCollection.and.returnValue(of({}));

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(async () => {
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);

    TestBed.configureTestingModule({
      // declarations moved to imports
      imports: [
        CollectionDetailComponent,
        getTranslocoModule(),
        FormsModule,

        ReactiveFormsModule,
        NoopAnimationsModule,
        RouterTestingModule,
        BrowserDynamicTestingModule,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        UIStatusService,
        { provide: BlogOdataService, useValue: storageService },
        NzModalService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionDetailComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    expect(readCollectionSpy).not.toHaveBeenCalled();
    expect(createCollectionSpy).not.toHaveBeenCalled();
  });

  describe('create mode', () => {
    it('create mode init without error', async () => {
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.uiMode).toEqual(UIMode.Create);
    });
  });
});
