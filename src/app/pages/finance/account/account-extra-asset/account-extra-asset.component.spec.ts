import { async, ComponentFixture, TestBed, inject, fakeAsync, tick, flush } from '@angular/core/testing';
import { Component, DebugElement, TemplateRef, ViewChild } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule, } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BehaviorSubject, of } from 'rxjs';

import { AccountExtraAssetComponent } from './account-extra-asset.component';
import { getTranslocoModule, FakeDataHelper, FormGroupHelper } from '../../../../../testing';
import { AssetCategory, AccountExtraAsset } from '../../../../model';

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

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        ReactiveFormsModule,
        NgZorroAntdModule,
        RouterTestingModule,
        NoopAnimationsModule,
        RouterTestingModule,
        getTranslocoModule(),
      ],
      declarations: [
        AccountExtraAssetComponent,
        FinanceAccountExtraAssetTestFormComponent,
      ],
    })
    .compileComponents();
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

    let ast1: AccountExtraAsset = new AccountExtraAsset();
    ast1.CategoryID = fakeData.finAssetCategories[0].ID;
    testingComponent.formGroup.get('infoControl').setValue(ast1);
    flush();
    tick();
    fixture.detectChanges();

    expect(testingComponent.formGroup.valid).toBeFalse();

    let astval2 = testingComponent.formGroup.get('infoControl').value as AccountExtraAsset;
    expect(astval2.CategoryID).toBeTruthy();
    expect(astval2.CategoryID).toEqual(ast1.CategoryID);
    expect(astval2.Name).toBeFalsy();
    expect(astval2.Comment).toBeFalsy();
    expect(astval2.RefDocForBuy).toBeFalsy();
    expect(astval2.RefDocForSold).toBeFalsy();
  }));

  it('shall work with data 3: input category and name', fakeAsync(() => {
    testingComponent.arAssetCategories = fakeData.finAssetCategories.slice();

    let ast1: AccountExtraAsset = new AccountExtraAsset();
    ast1.CategoryID = fakeData.finAssetCategories[0].ID;
    ast1.Name = 'test';
    testingComponent.formGroup.get('infoControl').setValue(ast1);
    flush();
    tick();
    fixture.detectChanges();

    expect(testingComponent.formGroup.valid).toBeTruthy();

    let astval2 = testingComponent.formGroup.get('infoControl').value as AccountExtraAsset;
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

    let ast1: AccountExtraAsset = new AccountExtraAsset();
    ast1.CategoryID = fakeData.finAssetCategories[0].ID;
    ast1.Name = 'test';
    ast1.Comment = 'comem';
    ast1.RefDocForBuy = 123;
    ast1.RefDocForSold = 345;
    testingComponent.formGroup.get('infoControl').setValue(ast1);
    flush();
    tick();
    fixture.detectChanges();

    expect(testingComponent.formGroup.valid).toBeTruthy();

    let astval2 = testingComponent.formGroup.get('infoControl').value as AccountExtraAsset;
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
    expect(testingComponent.assetComponent.isFieldChangable).toBeTruthy();

    testingComponent.formGroup.disable();
    flush();
    tick();
    fixture.detectChanges();

    expect(testingComponent.assetComponent.isFieldChangable).toBeFalsy();
  }));

  it('shall work with reference doc.', fakeAsync(() => {
    testingComponent.arAssetCategories = fakeData.finAssetCategories.slice();

    const routerstub = TestBed.get(Router);
    spyOn(routerstub, 'navigate');

    testingComponent.assetComponent.onRefDocClick(123);
    expect(routerstub.navigate).toHaveBeenCalledTimes(1);
    expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/display/123']);
  }));
});

@Component({
  template: `
  <form [formGroup]="formGroup">
    <hih-finance-account-extra-asset formControlName="infoControl"
      [arAssetCategories]="arAssetCategories"></hih-finance-account-extra-asset>
  </form>
  `
})
export class FinanceAccountExtraAssetTestFormComponent {
  public formGroup: FormGroup;
  public arAssetCategories: AssetCategory[] = [];
  @ViewChild(AccountExtraAssetComponent, {static: true}) assetComponent: AccountExtraAssetComponent;
  
  constructor() {
    this.formGroup = new FormGroup({
      infoControl: new FormControl()
    });
  }
}
