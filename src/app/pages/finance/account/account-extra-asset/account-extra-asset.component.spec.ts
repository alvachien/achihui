import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { Component, ViewChild } from '@angular/core';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup, UntypedFormControl } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { FinanceUIModule } from '../../finance-ui.module';
import { AccountExtraAssetComponent } from './account-extra-asset.component';
import { getTranslocoModule, FakeDataHelper } from '../../../../../testing';
import { AssetCategory, AccountExtraAsset } from '../../../../model';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

describe('AccountExtraAssetComponent', () => {
  let testingComponent: FinanceAccountExtraAssetTestFormComponent;
  let fixture: ComponentFixture<FinanceAccountExtraAssetTestFormComponent>;
  let fakeData: FakeDataHelper;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
    declarations: [AccountExtraAssetComponent, FinanceAccountExtraAssetTestFormComponent],
    imports: [FormsModule,
        FinanceUIModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        RouterTestingModule,
        getTranslocoModule()],
    providers: [provideHttpClient(withInterceptorsFromDi()), provideHttpClientTesting()]
}).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceAccountExtraAssetTestFormComponent);
    testingComponent = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create test component successfully', () => {
    expect(testingComponent).toBeTruthy();
  });

  it('shall work with data 1: init status', fakeAsync(() => {
    testingComponent.arAssetCategories = fakeData.finAssetCategories.slice();

    fixture.detectChanges();
    expect(testingComponent.formGroup.dirty).toBeFalse();
    expect(testingComponent.formGroup.valid).toBeFalse();
  }));

  it('shall work with data 2: input category', fakeAsync(() => {
    testingComponent.arAssetCategories = fakeData.finAssetCategories.slice();

    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    const ast1: AccountExtraAsset = new AccountExtraAsset();
    ast1.CategoryID = fakeData.finAssetCategories[0].ID;
    testingComponent.formGroup.get('infoControl')?.setValue(ast1);
    flush();
    tick();
    fixture.detectChanges();

    expect(testingComponent.formGroup.valid).toBeFalse();

    const astval2 = testingComponent.formGroup.get('infoControl')?.value as AccountExtraAsset;
    expect(astval2.CategoryID).toBeTruthy();
    expect(astval2.CategoryID).toEqual(ast1.CategoryID);
    expect(astval2.Name).toBeFalsy();
    expect(astval2.Comment).toBeFalsy();
    expect(astval2.RefDocForBuy).toBeFalsy();
    expect(astval2.RefDocForSold).toBeFalsy();
  }));

  it('shall work with data 3: input category and name', fakeAsync(() => {
    testingComponent.arAssetCategories = fakeData.finAssetCategories.slice();

    const ast1: AccountExtraAsset = new AccountExtraAsset();
    ast1.CategoryID = fakeData.finAssetCategories[0].ID;
    ast1.Name = 'test';
    testingComponent.formGroup.get('infoControl')?.setValue(ast1);
    flush();
    tick();
    fixture.detectChanges();

    expect(testingComponent.formGroup.valid).toBeTruthy();

    const astval2 = testingComponent.formGroup.get('infoControl')?.value as AccountExtraAsset;
    expect(astval2.CategoryID).toBeTruthy();
    expect(astval2.CategoryID).toEqual(ast1.CategoryID);
    expect(astval2.Name).toBeTruthy();
    expect(astval2.Name).toEqual('test');
    expect(astval2.Comment).toBeFalsy();
    expect(astval2.RefDocForBuy).toBeFalsy();
    expect(astval2.RefDocForSold).toBeFalsy();
  }));

  it('shall work with data 4: input category, name, comment and refenence docs', fakeAsync(() => {
    testingComponent.arAssetCategories = fakeData.finAssetCategories.slice();

    const ast1: AccountExtraAsset = new AccountExtraAsset();
    ast1.CategoryID = fakeData.finAssetCategories[0].ID;
    ast1.Name = 'test';
    ast1.Comment = 'comem';
    ast1.RefDocForBuy = 123;
    ast1.RefDocForSold = 345;
    testingComponent.formGroup.get('infoControl')?.setValue(ast1);
    flush();
    tick();
    fixture.detectChanges();

    expect(testingComponent.formGroup.valid).toBeTruthy();

    const astval2 = testingComponent.formGroup.get('infoControl')?.value as AccountExtraAsset;
    expect(astval2.CategoryID).toBeTruthy();
    expect(astval2.CategoryID).toEqual(ast1.CategoryID);
    expect(astval2.Name).toBeTruthy();
    expect(astval2.Name).toEqual('test');
    expect(astval2.Comment).toBeTruthy();
    expect(astval2.Comment).toEqual(ast1.Comment);
    expect(astval2.RefDocForBuy).toBeTruthy();
    expect(astval2.RefDocForBuy).toEqual(ast1.RefDocForBuy);
    expect(astval2.RefDocForSold).toBeTruthy();
    expect(astval2.RefDocForSold).toEqual(ast1.RefDocForSold);
  }));

  it('shall work with disabled mode', fakeAsync(() => {
    testingComponent.arAssetCategories = fakeData.finAssetCategories.slice();

    fixture.detectChanges();
    expect(testingComponent.assetComponent?.isFieldChangable).toBeTruthy();

    testingComponent.formGroup.disable();
    flush();
    tick();
    fixture.detectChanges();

    expect(testingComponent.assetComponent?.isFieldChangable).toBeFalsy();
  }));

  it('shall work with reference doc.', fakeAsync(() => {
    testingComponent.arAssetCategories = fakeData.finAssetCategories.slice();

    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');

    testingComponent.assetComponent?.onRefDocClick(123);
    expect(routerstub.navigate).toHaveBeenCalledTimes(1);
    expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/display/123']);
  }));
});

@Component({
    template: `
    <form [formGroup]="formGroup">
      <hih-finance-account-extra-asset formControlName="infoControl" [arAssetCategories]="arAssetCategories">
      </hih-finance-account-extra-asset>
    </form>
  `,
    imports: [
      FormsModule,
      ReactiveFormsModule,
      AccountExtraAssetComponent,
    ]
})
export class FinanceAccountExtraAssetTestFormComponent {
  public formGroup: UntypedFormGroup;
  public arAssetCategories: AssetCategory[] = [];
  @ViewChild(AccountExtraAssetComponent, { static: true }) assetComponent: AccountExtraAssetComponent | undefined;

  constructor() {
    this.formGroup = new UntypedFormGroup({
      infoControl: new UntypedFormControl(),
    });
  }
}
