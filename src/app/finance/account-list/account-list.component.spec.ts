import { async, ComponentFixture, TestBed, fakeAsync, flush, inject, tick } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';

import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { AccountListComponent } from './account-list.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService } from 'app/services';
import { Account, AccountStatusEnum } from '../../model';
import { MatSelect, MatOption } from '@angular/material';

describe('AccountListComponent', () => {
  let component: AccountListComponent;
  let fixture: ComponentFixture<AccountListComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllAccountsSpy: any;
  let routerSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
  });

  beforeEach(async(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const storageService: any = jasmine.createSpyObj('FinanceStorageService', ['fetchAllAccountCategories', 'fetchAllAccounts']);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
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
        AccountListComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: FinanceStorageService, useValue: storageService },
        { provide: Router, useValue: routerSpy },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountListComponent);
    component = fixture.componentInstance;
  });

  it('1. should be created without data', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.dataSource.data.length).toEqual(0);
  });

  describe('2. faked data with async loading', () => {
    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
    });

    it('should not show data before OnInit', () => {
      expect(component.dataSource.data.length).toEqual(0);
    });

    it('should show data after OnInit (fakeAsync)', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      expect(component.dataSource.data.length).toEqual(0);

      tick();
      fixture.detectChanges();

      expect(component.dataSource.data.length).toBeGreaterThan(0);
      expect(component.dataSource.data.length).toEqual(fakeData.finAccounts.filter(
        (val: Account) => {
        if (component.selectedStatus !== undefined && val.Status !== component.selectedStatus) {
          return false;
        }

        return true;
      }).length);
    }));
  });

  describe('3. Exception case handling (async loading)', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when Service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountsSpy.and.returnValue(asyncError('Service failed'));

      fixture.detectChanges();
      tick();
      // fixture.detectChanges();
      // flush();

      expect(overlayContainerElement.querySelectorAll('snack-bar-container').length).toBe(1);
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Service failed',
        'Expected snack bar to show the error message: Service failed');

      // Clear
      flush();
    }));
  });

  describe('4. check controls are worked as expected', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAccountsSpy.and.returnValue(asyncData(fakeData.finAccounts));
    });
    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));
    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('check create account button', () => {
      component.onCreateAccount();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/account/create']);
    });
    it('check display account button', () => {
      let acnt: Account = new Account();
      acnt.Id = 20;
      component.onDisplayAccount(acnt);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/account/display', acnt.Id]);
    });
    it('check edit account button', () => {
      let acnt: Account = new Account();
      acnt.Id = 20;
      component.onChangeAccount(acnt);
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/finance/account/edit', acnt.Id]);
    });

    // it('Check status changed select control', fakeAsync(() => {
    // //   let select: MatSelect = fixture.debugElement.query(By.css('mat-select')).componentInstance;

    // //   // Open
    // //   select.open();
    // //   fixture.detectChanges();
    // //   flush();

    // //   // Select the option

    // //   (overlayContainerElement.querySelectorAll('mat-option')[1] as HTMLElement).click();
    // //   fixture.detectChanges();
    // //   flush();
    // //   expect(component.selectedStatus).toBe(1);
    // }));

    it('Should reload data after status changed in select control', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      expect(component.dataSource.data.length).toEqual(0);

      // Default: Normal
      tick();
      fixture.detectChanges();
      expect(component.dataSource.data.length).toBeGreaterThan(0);
      expect(fetchAllAccountsSpy.calls.count()).toEqual(1);

      // Switch to Closed
      let trigger: any = fixture.debugElement.query(By.css('.finaccountlist-toolbar-item .mat-select-trigger')).nativeElement;
      trigger.click();
      fixture.detectChanges();
      flush();

      let options: NodeListOf<HTMLElement> = overlayContainerElement.querySelectorAll('mat-option');
      expect(options.length).toBeGreaterThan(0);
      let optidx: number = -1;
      let select: MatSelect = fixture.debugElement.query(By.css('.finaccountlist-toolbar-item mat-select')).componentInstance;
      select.options.forEach((item: MatOption, idx: number) => {
        if (item.value === AccountStatusEnum.Closed) {
          optidx = idx;
        }
      });
      expect(optidx).not.toEqual(-1);
      options[optidx].click();
      fixture.detectChanges();
      trigger.click();
      fixture.detectChanges();
      flush();
      expect(fetchAllAccountsSpy.calls.count()).toEqual(2);
      expect(component.dataSource.data.length).toEqual(fakeData.finAccounts.filter(
        (val: Account) => {
        if (component.selectedStatus !== undefined && val.Status !== AccountStatusEnum.Closed) {
          return false;
        }

        return true;
      }).length);

      // Reset-all
      trigger.click();
      fixture.detectChanges();
      // flush();
      options = overlayContainerElement.querySelectorAll('mat-option');
      options[0].click();
      fixture.detectChanges();
      trigger.click();
      fixture.detectChanges();
      flush();

      // expect(fetchAllAccountsSpy.calls.count()).toEqual(3);
      expect(component.dataSource.data.length).toEqual(fakeData.finAccounts.length);
    }));
  });
});
