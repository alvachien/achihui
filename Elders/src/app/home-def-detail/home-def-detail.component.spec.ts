import { async, ComponentFixture, TestBed, fakeAsync, inject, flush, tick, } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { UIDependModule } from '../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BehaviorSubject, of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayContainer } from '@angular/cdk/overlay';

import { HttpLoaderTestFactory, ActivatedRouteUrlStub, FakeDataHelper, asyncData, asyncError } from '../../testing';
import { HomeDefDetailComponent } from './home-def-detail.component';
import { AuthService, FinCurrencyService, HomeDefDetailService, UIStatusService, } from '../services';
import { UserAuthInfo } from '../model';
import { MessageDialogComponent } from '../message-dialog/message-dialog.component';

describe('HomeDefDetailComponent', () => {
  let component: HomeDefDetailComponent;
  let fixture: ComponentFixture<HomeDefDetailComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;
  let fakeData: FakeDataHelper;
  let fetchAllCurrenciesSpy: any;
  let createHomeDefSpy: any;
  let readHomeDefSpy: any;
  let routerSpy: any;
  let activatedRouteStub: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildCurrencies();

    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const currService: any = jasmine.createSpyObj('FinCurrencyService', ['fetchAllCurrencies']);
    fetchAllCurrenciesSpy = currService.fetchAllCurrencies.and.returnValue(of([]));
    const homeService: any = jasmine.createSpyObj('HomeDefDetailService', [
      'fetchHomeMembers',
      'createHomeDef',
      'readHomeDef',
    ]);
    homeService.ChosedHome = fakeData.chosedHome;
    const fetchHomeMembersSpy: any = homeService.fetchHomeMembers.and.returnValue([]);
    createHomeDefSpy = homeService.createHomeDef.and.returnValue(of({}));
    readHomeDefSpy = homeService.readHomeDef.and.returnValue(of({}));
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient],
          },
        }),
      ],
      declarations: [
        HomeDefDetailComponent,
        MessageDialogComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: AuthService, useValue: authServiceStub },
        { provide: FinCurrencyService, useValue: currService },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: Router, useValue: routerSpy },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
      ],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ MessageDialogComponent ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeDefDetailComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);
  });

  it('1. should be created without data', () => {
    expect(component).toBeTruthy();
  });

  describe('2. Create mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      createHomeDefSpy.and.returnValue(asyncData(fakeData.chosedHome));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when fetchAllCurrencies fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllCurrenciesSpy.and.returnValue(asyncError<string>('Service failed'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      fixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      flush();
    }));
    it('name is a mandatory', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      expect(component.IsCreateMode).toBeTruthy();

      // component.detailForm.get('nameControl').setValue('test1');
      component.detailForm.get('creatorDisplayAsControl').setValue('I am creator');
      component.detailForm.get('baseCurrControl').setValue('CNY');
      component.detailForm.get('detailControl').setValue('test');
      component.detailForm.updateValueAndValidity();

      expect(component.detailForm.valid).toBeFalsy();

      flush();
    }));
    it('creator display as is a mandatory', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      expect(component.IsCreateMode).toBeTruthy();

      component.detailForm.get('nameControl').setValue('test1');
      // component.detailForm.get('creatorDisplayAsControl').setValue('I am creator');
      component.detailForm.get('baseCurrControl').setValue('CNY');
      component.detailForm.get('detailControl').setValue('test');
      component.detailForm.updateValueAndValidity();

      expect(component.detailForm.valid).toBeFalsy();

      flush();
    }));
    it('base currency is a mandatory', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      expect(component.IsCreateMode).toBeTruthy();

      component.detailForm.get('nameControl').setValue('test1');
      component.detailForm.get('creatorDisplayAsControl').setValue('I am creator');
      // component.detailForm.get('baseCurrControl').setValue('CNY');
      component.detailForm.get('detailControl').setValue('test');
      component.detailForm.updateValueAndValidity();

      expect(component.detailForm.valid).toBeFalsy();

      flush();
    }));
    it('shall allow create in valid case', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      expect(component.IsCreateMode).toBeTruthy();

      component.detailForm.get('nameControl').setValue('test1');
      component.detailForm.get('creatorDisplayAsControl').setValue('I am creator');
      component.detailForm.get('baseCurrControl').setValue('CNY');
      component.detailForm.get('detailControl').setValue('test');
      component.detailForm.updateValueAndValidity();

      expect(component.detailForm.valid).toBeTruthy();

      component.onSubmit();
      expect(createHomeDefSpy).toHaveBeenCalled();
      tick(); // Complete the observable

      // Expect there is a snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).not.toBeNull();

      // After the snackbar, a navigation
      tick(2000);
      // fixture.detectChanges();
      // expect(routerSpy.navigate).toHaveBeenCalled();

      flush();
    }));
    it('shall handle create failed case', fakeAsync(() => {
      createHomeDefSpy.and.returnValue(asyncError('server 500'));

      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();

      expect(component.IsCreateMode).toBeTruthy();

      component.detailForm.get('nameControl').setValue('test1');
      component.detailForm.get('creatorDisplayAsControl').setValue('I am creator');
      component.detailForm.get('baseCurrControl').setValue('CNY');
      component.detailForm.get('detailControl').setValue('test');
      component.detailForm.updateValueAndValidity();

      expect(component.detailForm.valid).toBeTruthy();

      component.onSubmit();
      expect(createHomeDefSpy).toHaveBeenCalled();
      tick(); // Complete the observable
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      fixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      flush();
    }));
  });
  describe('3. Display mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllCurrenciesSpy.and.returnValue(asyncData(fakeData.currencies));
      readHomeDefSpy.and.returnValue(asyncData(fakeData.chosedHome));

      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('122', {})] as UrlSegment[]);
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display home def info', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // complete the Observable in ngOnInit
      fixture.detectChanges();
      tick(); // complete the readHomeDef
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeFalsy();
      expect(component.IsCreateMode).toBeFalsy();

      expect(component.detailForm.get('nameControl').value).toEqual(fakeData.chosedHome.Name);
      expect(component.detailForm.get('baseCurrControl').value).toEqual(fakeData.chosedHome.BaseCurrency);
      expect(component.arMembers.length).toEqual(fakeData.chosedHome.Members.length);

      flush();
    }));
  });
});
