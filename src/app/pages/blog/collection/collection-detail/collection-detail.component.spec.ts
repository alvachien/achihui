import { waitForAsync, ComponentFixture, TestBed, tick, fakeAsync } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { of, BehaviorSubject } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';
import { UrlSegment, ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { UIMode } from 'actslib';

import { BlogUIModule } from '../../blog-ui.module';
import { getTranslocoModule, FakeDataHelper, ActivatedRouteUrlStub } from '../../../../../testing';
import { CollectionDetailComponent } from './collection-detail.component';
import { AuthService, UIStatusService, BlogOdataService } from '../../../../services';
import { UserAuthInfo } from '../../../../model';
import { SafeAny } from 'src/common';

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

    storageService = jasmine.createSpyObj('BlogOdataService', ['readCollection', 'createCollection']);
    readCollectionSpy = storageService.readCollection.and.returnValue(of([]));
    createCollectionSpy = storageService.createCollection.and.returnValue(of({}));

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
      ],
      declarations: [CollectionDetailComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        UIStatusService,
        { provide: BlogOdataService, useValue: storageService },
        NzModalService,
      ],
    }).compileComponents();
  }));

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
    it('create mode init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();
      expect(component.uiMode).toEqual(UIMode.Create);
    }));
  });
});
