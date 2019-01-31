import { async, ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
} from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';

import { HttpLoaderTestFactory, RouterLinkDirectiveStub, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { AccountExtADPComponent } from './account-ext-adp.component';
import { FinanceStorageService, HomeDefDetailService } from 'app/services';
import { UIMode } from 'app/model';

describe('AccountExtADPComponent', () => {
  let component: AccountExtADPComponent;
  let fixture: ComponentFixture<AccountExtADPComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;
  let fakeData: FakeDataHelper;
  let calcADPTmpDocsSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildFinConfigData();

    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', ['calcADPTmpDocs']);
    calcADPTmpDocsSpy = stroageService.calcADPTmpDocs.and.returnValue(of([]));
    const homeService: Partial<HomeDefDetailService> = {};
    homeService.ChosedHome = fakeData.chosedHome;

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        BrowserAnimationsModule,
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
        RouterLinkDirectiveStub,
        AccountExtADPComponent,
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
    fixture = TestBed.createComponent(AccountExtADPComponent);
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

  describe('2. create mode', () => {
    beforeEach(() => {
      // Before Each
      component.uiMode = UIMode.Create;      
    });

    it('1. should display default values', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      expect(component.isFieldChangable).toEqual(true);
      expect(component.dataSource.data.length).toEqual(0);
      expect(component.extObject).toBeTruthy();
      expect(component.extObject.StartDate).toBeTruthy();
      expect(component.extObject.EndDate).toBeTruthy();

      const linkDes: any = fixture.debugElement.queryAll(By.directive(RouterLinkDirectiveStub));
      expect(linkDes.length).toEqual(0);
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
