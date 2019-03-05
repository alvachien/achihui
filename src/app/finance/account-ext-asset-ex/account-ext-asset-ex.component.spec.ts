import { async, ComponentFixture, TestBed, inject, fakeAsync, tick, flush, } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpLoaderTestFactory } from '../../../testing';
import { BrowserModule } from '@angular/platform-browser';
import { of } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule, ControlContainer, NgForm } from '@angular/forms';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';

import { RouterLinkDirectiveStub, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { AccountExtAssetExComponent } from './account-ext-asset-ex.component';
import { FinanceStorageService } from 'app/services';
import { CommonModule } from '@angular/common';
import { AccountExtraAsset } from 'app/model';

describe('AccountExtAssetExComponent', () => {
  let component: AccountExtAssetExComponent;
  let fixture: ComponentFixture<AccountExtAssetExComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllAssetCategoriesSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
    fakeData.buildCurrencies();
    fakeData.buildFinConfigData();
  });

  beforeEach(async(() => {
    const stroageService: any = jasmine.createSpyObj('FinanceStorageService', [
      'fetchAllAssetCategories',
    ]);
    fetchAllAssetCategoriesSpy = stroageService.fetchAllAssetCategories.and.returnValue(of([]));

    TestBed.configureTestingModule({
      imports: [
        CommonModule,
        UIDependModule,
        BrowserModule,
        ReactiveFormsModule,
        FormsModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient]
          }
        })
      ],
      declarations: [ AccountExtAssetExComponent ],
      providers: [
        TranslateService,
        { provide: FinanceStorageService, useValue: stroageService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountExtAssetExComponent);
    component = fixture.componentInstance;
  });

  it('1. should create', () => {
    expect(component).toBeTruthy();
  });

  describe('2. Exception case handling (async loading)', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAssetCategoriesSpy.and.returnValue(asyncData(fakeData.finAssetCategories));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('1. should display error when accont category service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAssetCategoriesSpy.and.returnValue(asyncError<string>('Asset category service failed'));

      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Asset category service failed',
        'Expected snack bar to show the error message: Asset category service failed');
      flush();
    }));
  });

  describe('3. Enable Mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let curAccount: AccountExtraAsset;

    beforeEach(() => {
      fetchAllAssetCategoriesSpy.and.returnValue(asyncData(fakeData.finAssetCategories));

      curAccount = new AccountExtraAsset();
      curAccount.CategoryID = fakeData.finAssetCategories[0].ID;
      curAccount.Name = 'Test';
      curAccount.Comment = 'test';
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('1. Name is mandatory', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();

      curAccount.Name = '';
      component.writeValue(curAccount);
      component.onChange();
      expect(component.assetInfoForm.valid).toBeFalsy();
      expect(component.validate(component.assetInfoForm)).not.toBeNull();
    }));
    it('2. Category ID is mandatory', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();

      curAccount.CategoryID = undefined;
      component.writeValue(curAccount);
      component.onChange();
      expect(component.assetInfoForm.valid).toBeFalsy();
      expect(component.validate(component.assetInfoForm)).not.toBeNull();
    }));
  });
  describe('4. Disable Mode', () => {
    beforeEach(() => {
      fetchAllAssetCategoriesSpy.and.returnValue(asyncData(fakeData.finAssetCategories));

      let curAccount: AccountExtraAsset;
      curAccount = new AccountExtraAsset();
      curAccount.CategoryID = fakeData.finAssetCategories[0].ID;
      curAccount.Name = 'Test';
      curAccount.Comment = 'test';
      component.writeValue(curAccount);
      component.setDisabledState(true);
    });

    it('shall work properly', fakeAsync(() => {
      fixture.detectChanges();
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeFalsy();
    }));
  });
});
