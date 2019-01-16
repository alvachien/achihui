# Unit Tests
Unit test is quite important to build a high-quality project;

However, the complexity of the project will also bring efforts to maintain the unit test classes.

Hereby list the useful points for composing a unit test.

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
```typescript
    const homeService: any = jasmine.createSpyObj('HomeDefService', ['ChosedHome', 'fetchHomeMembers']);
    const chosedHomeSpy: any = homeService.ChosedHome.and.returnValue( {
      _id: 1,
      BaseCurrency: 'CNY',
    });
    const fetchHomeMembersSpy: any = homeService.fetchHomeMembers.and.returnValue([]);
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

## FAQ
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
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
```
And:
```typescript
    imports: [
        BrowserAnimationsModule,
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
