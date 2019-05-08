# Unit Tests
Unit test is quite important to ensure a high-quality project, and it will bring more values in regression tests when logic are updated.

With respect to the complexity of the project, it will also bring efforts to maintain the unit test classes. 

Therefore, list out the reusable the code snippets for preparing the unit tests among the Services and components will benefit the development.

Hereby list the useful code snippets followed by the Frequently met issues.

## Must Read
Guideline is a must read, without any doubt.

[Testing in Angular](https://angular.cn/guide/testing)

## Reuse code snippets (for HIH only)
### HttpClient
Just import ```HttpClientTestingModule``` is enough.
```typescript
import { HttpClientTestingModule } from '@angular/router/testing'
```
Then:
```typescript
    imports: [
        HttpClientTestingModule,
        ...
    ]
```

### TranslateService (and Translate Pipe)
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

### Router
```typescript
const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
```

Add it into the providers section:
```typescript
{ provide: Router, useValue: routerSpy },
```


### ActivatedRoute
```typescript
const activatedRouteStub: any = new ActivatedRouteUrlStub([new UrlSegment('createbrwfrm', {})] as UrlSegment[]);
```

Add it into the providers section:
```typescript
{ provide: ActivatedRoute, useValue: activatedRouteStub },
```

### HomeDefService
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


### AuthService
```typescript
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
```

Add it into the providers section:
```typescript
{ provide: AuthService, useValue: authServiceStub },
```


### FinCurrencyService
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
    uiServiceStub.getUILabel = (le: any) => { return ''; };
```

Add it into the providers section:
```typescript
{ provide: UIStatusService, useValue: uiServiceStub },
```

### ThemeStorage
```typescript
    const themeStorageStub: Partial<ThemeStorage> = {};
    themeStorageStub.getStoredTheme = () => { return undefined; };
    themeStorageStub.onThemeUpdate = new EventEmitter<any>();
```

Add it into the providers section:
```typescript
{ provide: ThemeStorage, useValue: themeStorageStub },
```

### DateAdapter
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

### FinanceStorageService
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

### LearnStorageService
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

### LangaugeService
```typescript
    const langService: any = jasmine.createSpyObj('LanguageService', ['fetchAllLanguages']);
    const fetchAllLanguagesSpy: any = langService.fetchAllLanguages.and.return();
    langService.Languages = [];
```
Add the provider:
```typescript
    { provide: LanguageService, useValue: langService },
```

### Material Controls
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


## FMI (Frequently Met Issues)
### Error: Can't bind to 'ngModel' since it isn't a known property of 'mat-select'.
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


### Error: Found the synthetic property @transitionMessages. Please include either "BrowserAnimationsModule" or "NoopAnimationsModule" in your application.
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

### Error: Can't bind to 'routerLink' since it isn't a known property of 'a'.
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

### Failed: Template parse errors: 'router-outlet' is not a known element.
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
- Error: Expected one matching request for criteria "Match URL: http://localhost:25688/api/FinanceAccountCategory", found none.
- Error: Expected no open requests, found 1: GET http://localhost:25688/api/FinanceAccountCategory

```typescript
    const req: any = httpTestingController.expectOne(requrl => {
        return requrl.method === 'GET' && requrl.url === accountCategoryAPIURL && requrl.params.has('hid');
    });
    expect(req.request.params.get('hid')).toEqual(fakeData.chosedHome.ID.toString());
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
You use routerSpy to hook the navigate method of Router.

Then, you can use:
```typescript
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/url1/url2']);
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

### Expecting a snackbar
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


### Expecting a dialog
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
