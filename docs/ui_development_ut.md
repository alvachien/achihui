# Unit Tests

Unit test is quite important to ensure a high-quality project, and it will bring more values in regression tests when logic are updated.

With respect to the complexity of the project, it will also bring efforts to maintain the unit test classes. 

Therefore, list out the reusable the code snippets for preparing the unit tests among the Services and components will benefit the development.

Hereby list the useful code snippets followed by the Frequently met issues.

## Must Read

Guideline is a must read, without any doubt.

[Testing in Angular](https://angular.cn/guide/testing)

## Reuse code snippets (for HIH only)

### Add Ant Design module

```typescript
import { NgZorroAntdModule, } from 'ng-zorro-antd';
```

And then add imports:

```typescript
  imports: [
    NgZorroAntdModule,
    ...
  ]
```

### HttpClient

Just import ```HttpClientTestingModule``` is enough.

```typescript
import { HttpClientTestingModule } from '@angular/common/http/testing';
```

Then:

```typescript
  imports: [
    HttpClientTestingModule,
    ...
  ]
```

### [Obsoleted, and use TranslocoService instead] TranslateService (and Translate Pipe)

```typescript
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
```

Then:

```typescript
  imports: [
    HttpClientTestingModule,
    TranslateModule.forRoot({
        loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderTestFactory,
        deps: [HttpClient],
        },
    }),
    ...
  ],
  providers: [
    TranslateService,
    ...
  ]
```

Test factory function

```typescript
export function HttpLoaderTestFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}
```

### TranslocoService

The following code snipets coming from here <https://netbasal.gitbook.io/transloco/general/unit-testing.>

```typescript
import { TranslocoTestingModule } from '@jsverse/transloco';
import en from '../assets/i18n/en.json';
import es from '../assets/i18n/es.json';

export function getTranslocoModule(config: Partial<TranslocoConfig> = {}) {
  return TranslocoTestingModule.withLangs(
    { en, es },
    {
      availableLangs: ['en', 'es'],
      defaultLang: 'en',
      ...config
    }
  );
}
```

And in test module:

```typescript
describe('AppComponent', () => {
  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [getTranslocoModule()],
      declarations: [AppComponent]
    }).compileComponents();
  }));

  it('should work', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('h1'))
               .nativeElement.innerText).toBe('hello');
  });
});
```

### Router

Import ```RouterTestingModule``` from Angular libary.
```typescript
import { RouterTestingModule } from '@angular/router/testing';
```

And in the testing methods:
```typescript
  const routerstub = TestBed.inject(Router);
  spyOn(routerstub, 'navigate');

  expect(routerstub.navigate).toHaveBeenCalled();
  expect(routerstub.navigate).toHaveBeenCalledWith(['/']);
```

### ActivatedRoute

```typescript
const activatedRouteStub: any = new ActivatedRouteUrlStub([new UrlSegment('createbrwfrm', {})] as UrlSegment[]);
```

Add it into the providers section:

```typescript
{ provide: ActivatedRoute, useValue: activatedRouteStub },
```

### [Obsoleted, use HomeDefOdataService instead] HomeDefService

The method fetchHomeMembers has been retired.

So before:

```typescript
    const homeService: any = jasmine.createSpyObj('HomeDefDetailService', ['ChosedHome', 'fetchHomeMembers']);
    homeService.ChosedHome = {
      _id: 1,
      BaseCurrency: 'CNY',
    };
    const fetchHomeMembersSpy: any = homeService.fetchHomeMembers.and.returnValue([]);
```

After:

```typescript
    const homeService: Partial<HomeDefDetailService> = {
        ChosedHome: fakeData.chosedHome,
        MembersInChosedHome: fakeData.chosedHome.Members,
    };
```

Add it into the providers section:

```typescript
{ provide: HomeDefDetailService, useValue: homeService },
```

### HomeDefOdataService

Create Partial object:
```typescript
  const homeService: Partial<HomeDefOdataService> = {
    ChosedHome: fakeData.chosedHome,
  };
```

Add it into the providers section:

```typescript
{ provide: HomeDefOdataService, useValue: homeService },
```

### AuthService

```typescript
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
```

Add it into the providers section:

```typescript
{ provide: AuthService, useValue: authServiceStub },
```

### [Obsoleted, use FinanceOdataService instead] FinCurrencyService

```typescript
    const currService: any = jasmine.createSpyObj('FinCurrencyService', ['fetchAllCurrencies']);
    const fetchAllCurrenciesSpy: any = currService.fetchAllCurrencies.and.returnValue(of([]));
```

Add it into the providers section:

```typescript
{ provide: FinCurrencyService, useValue: currService },
```

### UIStatusService

Just use UIStatusService directly because it has no dependencies.

The following are outdated stub for UIStatusService.

```typescript
  const uiServiceStub: Partial<UIStatusService> = {};
```

Add it into the providers section:

```typescript
{ provide: UIStatusService, useValue: uiServiceStub },
```

### [Obsoleted] ThemeStorage

```typescript
  const themeStorageStub: Partial<ThemeStorage> = {};
  themeStorageStub.getStoredTheme = () => { return undefined; };
  themeStorageStub.onThemeUpdate = new EventEmitter<any>();
```

Add it into the providers section:

```typescript
{ provide: ThemeStorage, useValue: themeStorageStub },
```

### [Obsoleted] DateAdapter

Add it into the providers section:

```typescript
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl, } from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';
```

Add into providers section:

```typescript
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
```

### [Obsoleted, Use FinanceOdataService instead] FinanceStorageService

```typescript
    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllAccountCategories',
      'fetchAllDocTypes',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'fetchAllAssetCategories',
    ]);
    const fetchAllAccountCategoriesSpy: any = stroageService.fetchAllAccountCategories.and.returnValue(of([]));
    const fetchAllAssetCategoriesSpy: any = stroageService.fetchAllAssetCategories.and.returnValue(of([]));
    const fetchAllDocTypesSpy: any = stroageService.fetchAllDocTypes.and.returnValue(of([]));
    const fetchAllTranTypesSpy: any = stroageService.fetchAllTranTypes.and.returnValue(of([]));
    const fetchAllAccountsSpy: any = stroageService.fetchAllAccounts.and.returnValue(of([]));
    const fetchAllOrdersSpy: any = stroageService.fetchAllOrders.and.returnValue(of([]));
    const fetchAllControlCentersSpy: any = stroageService.fetchAllControlCenters.and.returnValue(of([]));
```

Add it into the providers section:

```typescript
{ provide: FinanceStorageService, useValue: stroageService },
```

### FinanceOdataService

```typescript
    const stroageService: any = jasmine.createSpyObj('FinanceOdataService', [
      'fetchAllAccountCategories',
      'fetchAllDocTypes',
      'fetchAllTranTypes',
      'fetchAllAccounts',
      'fetchAllControlCenters',
      'fetchAllOrders',
      'fetchAllAssetCategories',
    ]);
    const fetchAllAccountCategoriesSpy: any = stroageService.fetchAllAccountCategories.and.returnValue(of([]));
    const fetchAllAssetCategoriesSpy: any = stroageService.fetchAllAssetCategories.and.returnValue(of([]));
    const fetchAllDocTypesSpy: any = stroageService.fetchAllDocTypes.and.returnValue(of([]));
    const fetchAllTranTypesSpy: any = stroageService.fetchAllTranTypes.and.returnValue(of([]));
    const fetchAllAccountsSpy: any = stroageService.fetchAllAccounts.and.returnValue(of([]));
    const fetchAllOrdersSpy: any = stroageService.fetchAllOrders.and.returnValue(of([]));
    const fetchAllControlCentersSpy: any = stroageService.fetchAllControlCenters.and.returnValue(of([]));
```

Add it into the providers section:

```typescript
{ provide: FinanceOdataService, useValue: stroageService },
```

### Pipes (like uiAccountStatusFilter)

Just add them into declaration sections:

```typescript
      declarations: [
        UIAccountStatusFilterPipe,
        UIAccountCtgyFilterPipe,
        UIAccountCtgyFilterExPipe,
        UIOrderValidFilterPipe,
        UIOrderValidFilterExPipe,
      ]
```

### [Obsoleted] LearnStorageService

```typescript
    const lrnStroageService: any = jasmine.createSpyObj('LearnStorageService', [
      'getHistoryReportByUser',
    ]);
    const getHistoryReportByUserSpy: any = lrnStroageService.getHistoryReportByUser.and.returnValue(of([]));
```

Add it into the providers section:

```typescript
    { provide: LearnStorageService, useValue: lrnStroageService },
```

### [Obsoleted, Use LangaugeOdataService instead] LangaugeService

```typescript
    const langService: any = jasmine.createSpyObj('LanguageService', ['fetchAllLanguages']);
    const fetchAllLanguagesSpy: any = langService.fetchAllLanguages.and.return();
    langService.Languages = [];
```

Add the provider:

```typescript
    { provide: LanguageService, useValue: langService },
```

### LangaugeOdataService

```typescript
    const langService: any = jasmine.createSpyObj('LangaugeOdataService', ['fetchAllLanguages']);
    const fetchAllLanguagesSpy: any = langService.fetchAllLanguages.and.return();
    langService.Languages = [];
```

Add the provider:

```typescript
    { provide: LangaugeOdataService, useValue: langService },
```

### [Obsoleted] Material Controls

In general, to learn how to operate Material Control, refer to [Official Github Repo](https://github.com/angular/material2/blob/master/src/lib/)

#### Tab Group

There are two ways to switch the tab:

```typescript
    let tabComponent: MatTabGroup = fixture.debugElement
        .query(By.css('mat-tab-group')).componentInstance;
    tabComponent.selectedIndex = 2;
```

Or,

```typescript
  let tabLabel = fixture.debugElement.queryAll(By.css('.mat-tab-label'))[1];
  tabLabel.nativeElement.click();
```

### Testing Components with Popup dialog

To test components with popup dialogs:

Add following imports:
```typescript
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';

import { MessageDialogComponent } from '../../../message-dialog';
```

Then, 
```typescript
    TestBed.configureTestingModule({
      declarations: [
        ...
        MessageDialogComponent,
      ],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ MessageDialogComponent ],
      },
    }).compileComponents();
```

Writing testing as following:

```typescript
  describe('2. should prevent errors by the checking logic', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it(() => {
      // Dialog
      const dlgElement: any = overlayContainerElement.querySelector('.ant-modal-body');
      expect(dlgElement.textContent).toContain('XXX',
        'Expected dialog to show the error message: XXX');
      flush();

    });
  });
```

## FMI (Frequently Met Issues)

### Error: Can't bind to 'ngModel' since it isn't a known property of 'mat-select'

It's due to the FormsModule is missing, and it's recommend to add FormsModule and ReactiveFormModule both;

```typescript
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
```

And import them both:

```typescript
  imports: [
      FormsModule,
      ReactiveFormsModule,
      ...
  ]
```

### Error: TypeError: Cannot read property 'length' of undefined

It mostly probably coming from Paginator's binding:

```HTML
  <mat-paginator #paginator
    [length]="_storageService.TranTypes.length"
    [pageIndex]="0"
    [pageSize]="15"
    [pageSizeOptions]="[5, 10, 25, 100]">
  </mat-paginator>
```

Just remove the binding here.

### Error: Found the synthetic property @transitionMessages. Please include either "BrowserAnimationsModule" or "NoopAnimationsModule" in your application

Do as the error message indicates. The included path as following:

```typescript
import { NoopAnimationsModule, BrowserAnimationsModule } from '@angular/platform-browser/animations';
```

And:

```typescript
  imports: [
      NoopAnimationsModule,
      ...
  ]
```

### Error: Can't bind to 'routerLink' since it isn't a known property of 'a'

Using the common defined Directive ```RouterLinkDirectiveStub``` as the Stub, and include that Directive class in the declaration section.

```typescript
import { HttpLoaderTestFactory, RouterLinkDirectiveStub } from '../../../testing';
```

Then,

```typescript
  declarations: [
    RouterLinkDirectiveStub,
    ...,
  ],
```

### Failed: Template parse errors: 'router-outlet' is not a known element

Just import the ```RouterTestingModule``` is enough.

```typescript
import { RouterTestingModule } from '@angular/router/testing';
```

Then:

```typescript
  imports: [
    RouterTestingModule,
    ...
  ]
```

### Error: Failed: Cannot read property 'root' of undefined

Once using ```RouterTestingModule```, you shall not use other provider for ```Router``` or other directive for ```routeLink``.
And it shall use ```RouterTestingModule```, and use following codes to spy method ```navigate```.
```typescript
  const routerstub = TestBed.get(Router);
  spyOn(routerstub, 'navigate');
```

### Error: NullInjectorError: No provider for Location

Solution is, add ```RouterTestingModule``` into the ```imports``` sections of testing module.

### Error: Unexpected value 'HttpTestingController' imported by the module 'DynamicTestModule'

Solution is, shall use ```HttpClientTestingModule``` instead of ```HttpTestingController```.

### Error: [@ant-design/icons-angular]:the icon arrow-left-o does not exist or is not registered.

Solution is, import ```HttpClientTestingModule```.

### Error: TypeError: _co.t is not a function

There is an error in HTML file when using ```transloco```. 

Solution is, add a root DIV element:
```HTML
<div *transloco="let t">
</div>
```

### Asynchronous service testing

There are several kind of methods to test it, see example [origin link](https://stackblitz.com/angular/gqeobkypklv?file=src%2Fapp%2Ftwain%2Ftwain.component.spec.ts)

Refer to ```LanguageService.spec.ts``` for an resuable testing.

### Using ```HttpTestingController``` handle URL with/without parameters

To check the URL without parameters, is quite simple:

```typescript
  const req: any = httpTestingController.expectOne(currAPIURL);
  expect(req.request.method).toEqual('GET');
```

To check the URL with parameters, normally you get two error messages (in sequence) like:

- Error: Expected one matching request for criteria "Match URL: http://localhost:25688/FinanceAccountCategory", found none.
- Error: Expected no open requests, found 1: GET http://localhost:25688/FinanceAccountCategory

```typescript
    const req: any = httpTestingController.expectOne(requrl => {
        return requrl.method === 'GET' && requrl.url === accountCategoryAPIURL && requrl.params.has('$select');
    });
    expect(req.request.params.get('$select')).toEqual(fakeData.chosedHome.ID.toString());
```

### Handling parameters on spy function

First approach:

```typescript
  fetchAllTagsSpy
    .withArgs(true).and.returnValue(asyncData(fakeData.tagsCount));
```

Second approach:

```typescript
  fetchAllAccountsSpy = storageService.fetchAllAccounts.and.callFake(() => {
    console.log('Entering fakeing function 1');
    return of([]);
  });
```

### Trigger change detect on-demand not by default

Do check that

```typescript
fixture.detectChanges();
```

is added in befreEach()!!!

### Read content from Input element

To read the content:

```typescript
let inputEl = fixture.debugElement.query(By.css('input'));
```

Simulate the input

```typescript
inputEl.nativeElement.value = 'hello';
// Simulate input event.
inputEl.triggerEventHandler('input', {target: inputEl.nativeElement});
```

### Using .toHaveBeenCalledWith to check router

You use ```routerStub``` to ```spyOn``` the navigate method of ```Router```.

Then, you can use:

```typescript
  expect(routerStub.navigate).toHaveBeenCalledWith(['/url1/url2']);
```

In case the navigate contains parameters:

```typescript
  expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/account/display', acnt.Id]);
```

### Testing routerLink's target

Using codes below:

```typescript
  const linkDes: any = fixture.debugElement
      .queryAll(By.directive(RouterLinkDirectiveStub));

  const routerLinks: any = linkDes.map((de: any) => de.injector.get(RouterLinkDirectiveStub));
  expect(routerLinks.length).toBe(3, 'should have 3 routerLinks');
  expect(routerLinks[0].linkParams).toBe('/a');
  expect(routerLinks[1].linkParams).toBe('/b');
  expect(routerLinks[2].linkParams).toBe('/c');
```

Test the link is work:

```typescript
  it('can click link in template', () => {
    const heroesLinkDe = linkDes[1];   // link DebugElement
    const heroesLink = routerLinks[1]; // link directive

    expect(heroesLink.navigatedTo).toBeNull('should not have navigated yet');

    heroesLinkDe.triggerEventHandler('click', null);
    fixture.detectChanges();

    expect(heroesLink.navigatedTo).toBe('/heroes');
  });
```

### Using NoopAnimationsModule in testing instead of BrowserAnimationsModule

Due to the fact that the animation will start the timer in another thread, the fakeAsync() not working well for SnackBar case.
Therefore, use NoopAnimationsModule will help.

```typescript
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
```

### [Obsoleted] Expecting a snackbar (Material Library)

Ensure the definition of overlayContainerElement was defined:

```typescript
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  beforeEach(inject([OverlayContainer],
    (oc: OverlayContainer) => {
    overlayContainer = oc;
    overlayContainerElement = oc.getContainerElement();
  }));

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });
```

Then, expect there is a snackbar for 'text':

```typescript
  let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
  expect(messageElement.textContent).toContain('text', 'Expected snack bar to show the error message: text');
```

### [Obsoleted] Expecting a dialog (Material Library)

Ensure the definition of overlayContainerElement was defined:

```typescript
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  beforeEach(inject([OverlayContainer],
    (oc: OverlayContainer) => {
    overlayContainer = oc;
    overlayContainerElement = oc.getContainerElement();
  }));

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });
```

Expect there is a popup dialog for text:

```typescript
  expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
  // Since there is only one button
  (overlayContainerElement.querySelector('button') as HTMLElement).click();
  tick();
  fixture.detectChanges();
  expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);
```

### Expecting a dialog (Ant Design Library)

Ensure the definition of overlayContainerElement was defined:

```typescript
  let overlayContainer: OverlayContainer;
  let overlayContainerElement: HTMLElement;

  beforeEach(inject([OverlayContainer],
    (oc: OverlayContainer) => {
    overlayContainer = oc;
    overlayContainerElement = oc.getContainerElement();
  }));

  afterEach(() => {
    overlayContainer.ngOnDestroy();
  });
```

Expect there is a popup dialog for error:

```typescript
  expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(1);
  // OK button
  (overlayContainerElement.querySelector('.ant-modal-close') as HTMLElement).click();
  tick();
  fixture.detectChanges();
  expect(overlayContainerElement.querySelectorAll('.ant-modal-body').length).toBe(0);
```
