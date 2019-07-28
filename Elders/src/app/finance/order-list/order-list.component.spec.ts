import { async, ComponentFixture, TestBed, fakeAsync, tick, inject, flush, } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MAT_DATE_FORMATS, DateAdapter, MAT_DATE_LOCALE, MAT_DATE_LOCALE_PROVIDER, MatPaginatorIntl,
} from '@angular/material';
import { MAT_MOMENT_DATE_FORMATS, MomentDateAdapter } from '@angular/material-moment-adapter';

import { HttpLoaderTestFactory, ActivatedRouteUrlStub, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { OrderListComponent } from './order-list.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService, FinCurrencyService } from 'app/services';
import { Order } from '../../model';

describe('OrderListComponent', () => {
  let component: OrderListComponent;
  let fixture: ComponentFixture<OrderListComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllOrdersSpy: any;
  let routerSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinControlCenter();
    fakeData.buildFinOrders();

    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllOrders',
    ]);
    fetchAllOrdersSpy = stroageService.fetchAllOrders.and.returnValue(of([]));
    const currService: any = jasmine.createSpyObj('FinCurrencyService', ['fetchAllCurrencies']);
    const fetchAllCurrenciesSpy: any = currService.fetchAllCurrencies.and.returnValue(of([]));
    const homeService: Partial<HomeDefDetailService> = {};
    homeService.ChosedHome = fakeData.chosedHome;
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

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
        OrderListComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
        { provide: DateAdapter, useClass: MomentDateAdapter, deps: [MAT_DATE_LOCALE] },
        { provide: MAT_DATE_FORMATS, useValue: MAT_MOMENT_DATE_FORMATS },
        { provide: FinanceStorageService, useValue: stroageService },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: Router, useValue: routerSpy },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OrderListComponent);
    component = fixture.componentInstance;
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });

  describe('shall load the data', () => {
    beforeEach(() => {
      fetchAllOrdersSpy.and.returnValue(asyncData(fakeData.finOrders));
    });
    afterEach(() => {
      // Do nothing
    });

    it('shall make the links shall work', fakeAsync(() => {
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      component.onCreateOrder();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/order/create']);

      let curOder: Order = fakeData.finOrders[0];
      component.onChangeOrder(curOder);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/order/edit', curOder.Id]);

      component.onDisplayOrder(curOder);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/order/display', curOder.Id]);
    }));
  });
});
