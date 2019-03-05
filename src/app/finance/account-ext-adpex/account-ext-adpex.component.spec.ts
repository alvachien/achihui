import { async, ComponentFixture, TestBed, fakeAsync, tick, flush, inject, } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
} from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment';
import { OverlayContainer } from '@angular/cdk/overlay';
import { RouterTestingModule } from '@angular/router/testing';

import { HttpLoaderTestFactory, RouterLinkDirectiveStub, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { AccountExtADPExComponent } from './account-ext-adpex.component';
import { FinanceStorageService, HomeDefDetailService } from 'app/services';
import { UIMode, RepeatFrequencyEnum, FinanceADPCalAPIOutput, AccountExtraAdvancePayment, TemplateDocADP } from 'app/model';

describe('AccountExtADPExComponent', () => {
  let component: AccountExtADPExComponent;
  let fixture: ComponentFixture<AccountExtADPExComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;
  let fakeData: FakeDataHelper;
  let calcADPTmpDocsSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccountExtraAdvancePayment();
  });

  beforeEach(async(() => {
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', ['calcADPTmpDocs']);
    calcADPTmpDocsSpy = stroageService.calcADPTmpDocs.and.returnValue(of([]));
    const homeService: Partial<HomeDefDetailService> = {};
    homeService.ChosedHome = fakeData.chosedHome;

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient],
          },
        }),
      ],
      declarations: [
        RouterLinkDirectiveStub,
        AccountExtADPExComponent,
      ],
      providers: [
        TranslateService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: Router, useValue: routerSpy },
        { provide: FinanceStorageService, useValue: stroageService },
        { provide: HomeDefDetailService, useValue: homeService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountExtADPExComponent);
    component = fixture.componentInstance;
    translate = TestBed.get(TranslateService);
    http = TestBed.get(HttpTestingController);

    // // find DebugElements with an attached RouterLinkStubDirective
    // const linkDes: any = fixture.debugElement
    //   .queryAll(By.directive(RouterLinkDirectiveStub));

    // // get attached link directive instances
    // // using each DebugElement's injector
    // const routerLinks: any = linkDes.map((de: any) => de.injector.get(RouterLinkDirectiveStub));
  });

  it('1. should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('2. enable mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let accountExtra: AccountExtraAdvancePayment;

    beforeEach(() => {
      // Before Each
      accountExtra = new AccountExtraAdvancePayment();

      let arrst: FinanceADPCalAPIOutput[] = [];
      for (let i: number = 0; i < 10; i ++) {
        let rst: FinanceADPCalAPIOutput = {
          TranDate: moment(),
          TranAmount: 10,
          Desp: `test-${i}`,
        };
        arrst.push(rst);
      }
      calcADPTmpDocsSpy.and.returnValue(asyncData(arrst));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('1. should display default values', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      expect(component.isFieldChangable).toEqual(true);
      expect(component.dataSource.data.length).toEqual(0);
      expect(component.canCalcTmpDocs).toBeFalsy();

      const linkDes: any = fixture.debugElement.queryAll(By.directive(RouterLinkDirectiveStub));
      expect(linkDes.length).toEqual(0);
    }));

    it('2. should check the valid for calc. tmp docs', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      let accountExtra2: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
      accountExtra2.Comment = 'Test';
      accountExtra2.RepeatType = RepeatFrequencyEnum.Month;
      component.writeValue(accountExtra2);
      component.onChange();
      component.tranAmount = 200;
      component.tranType = 2;
      fixture.detectChanges();

      expect(component.canCalcTmpDocs).toBeTruthy();
    }));

    it('3. should generate tmp docs', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      let accountExtra2: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
      accountExtra2.Comment = 'Test';
      accountExtra2.RepeatType = RepeatFrequencyEnum.Month;
      component.writeValue(accountExtra2);
      component.onChange();
      component.tranAmount = 200;
      component.tranType = 2;
      fixture.detectChanges();

      component.onGenerateTmpDocs();
      tick();
      expect(calcADPTmpDocsSpy).toHaveBeenCalled();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toBeGreaterThan(0);

      expect(component.extObject.dpTmpDocs.length).toBeGreaterThan(0);
    }));

    it('4. shall display error for exceptions', fakeAsync(() => {
      calcADPTmpDocsSpy.and.returnValue(asyncError('Service Error!'));

      let accountExtra2: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
      accountExtra2.Comment = 'Test';
      accountExtra2.RepeatType = RepeatFrequencyEnum.Month;
      component.writeValue(accountExtra2);
      component.onChange();
      component.tranAmount = 200;
      fixture.detectChanges();

      component.onGenerateTmpDocs();
      tick();
      expect(calcADPTmpDocsSpy).toHaveBeenCalled();

      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Service Error',
        'Expected snack bar to show the error message: Service Error');
      flush();
    }));
  });

  describe('3. disable mode', () => {
    beforeEach(() => {
      // Before Each
      let fakedAccountExtra: AccountExtraAdvancePayment = new AccountExtraAdvancePayment();
      fakedAccountExtra.Comment = 'Test';
      fakedAccountExtra.RepeatType = RepeatFrequencyEnum.Month;
      for (let i: number = 0; i < 10; i++) {
        let item: TemplateDocADP = new TemplateDocADP();
        item.HID = fakeData.chosedHome.ID;
        item.DocId = i + 1;
        item.TranType = 2;
        item.TranDate = moment().add(i + 1, 'M');
        item.TranAmount = 20;
        item.Desp = `item ${i + 1}`;
        fakedAccountExtra.dpTmpDocs.push(item);
      }

      component.writeValue(fakedAccountExtra);
      component.setDisabledState(true);
    });

    it('1. shall display tmp. docs', fakeAsync(() => {
      // Shall display the tmp. docs by default
      fixture.detectChanges(); // ngOnInit

      expect(component.dataSource.data.length).toBeGreaterThan(0);
    }));
  });

  // Example codes to test routerLink!!!
  // it('can get RouterLinks from template', () => {
  //   expect(routerLinks.length).toBe(3, 'should have 3 routerLinks');
  //   expect(routerLinks[0].linkParams).toBe('/dashboard');
  //   expect(routerLinks[1].linkParams).toBe('/heroes');
  //   expect(routerLinks[2].linkParams).toBe('/about');
  // });

  // it('can click Heroes link in template', () => {
  //   const heroesLinkDe = linkDes[1];   // heroes link DebugElement
  //   const heroesLink = routerLinks[1]; // heroes link directive

  //   expect(heroesLink.navigatedTo).toBeNull('should not have navigated yet');

  //   heroesLinkDe.triggerEventHandler('click', null);
  //   fixture.detectChanges();

  //   expect(heroesLink.navigatedTo).toBe('/heroes');
  // });
});
