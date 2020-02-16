import { async, ComponentFixture, TestBed, fakeAsync, tick, flush, inject } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, UrlSegment, ActivatedRoute } from '@angular/router';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';

import { HomeDefDetailComponent } from './home-def-detail.component';
import { getTranslocoModule, FakeDataHelper, ActivatedRouteUrlStub, asyncData } from '../../../../testing';
import { AuthService, HomeDefOdataService, FinanceOdataService, } from '../../../services';
import { UserAuthInfo } from '../../../model';
import { MessageDialogComponent } from '../../message-dialog';

describe('HomeDefDetailComponent', () => {
  let component: HomeDefDetailComponent;
  let fixture: ComponentFixture<HomeDefDetailComponent>;
  const authServiceStub: Partial<AuthService> = {};
  let fakeData: FakeDataHelper;
  let homeService: any;
  let readHomeDefSpy: any;
  let finService: any;
  let fetchAllCurrenciesSpy: any;
  let activatedRouteStub: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    homeService = jasmine.createSpyObj('HomeDefOdataService', [
      'readHomeDef',
    ]);
    readHomeDefSpy = homeService.readHomeDef.and.returnValue(of([]));
    finService = jasmine.createSpyObj('FinanceOdataService', [
      'fetchAllCurrencies'
    ]);
    fetchAllCurrenciesSpy = finService.fetchAllCurrencies.and.returnValue(of([]));

    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
  });

  beforeEach(async(() => {
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);

    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        NgZorroAntdModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        RouterTestingModule,
        getTranslocoModule(),
      ],
      declarations: [
        HomeDefDetailComponent,
        MessageDialogComponent,
      ],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: FinanceOdataService, useValue: finService },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [
          MessageDialogComponent,
        ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeDefDetailComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('create mode', () => {
    beforeEach(() => {
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
    });

    it('create mode init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.IsCreateMode).toBeTruthy();

      flush();
    }));
  });

  describe('2. change mode', () => {
    beforeEach(() => {
      activatedRouteStub.setURL([new UrlSegment('edit', {}), new UrlSegment('122', {})] as UrlSegment[]);

      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      readHomeDefSpy.and.returnValue(asyncData(fakeData.chosedHome));
    });

    it('change mode init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.IsCreateMode).toBeFalsy();

      flush();
    }));
  });

  describe('3. display mode', () => {
    beforeEach(() => {      
      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('122', {})] as UrlSegment[]);

      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      readHomeDefSpy.and.returnValue(asyncData(fakeData.chosedHome));
    });

    it('display mode init without error', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component).toBeTruthy();

      expect(component.isFieldChangable).toBeFalsy();
      expect(component.IsCreateMode).toBeFalsy();

      flush();
    }));
  });
});
