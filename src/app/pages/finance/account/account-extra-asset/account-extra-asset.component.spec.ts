import { async, ComponentFixture, TestBed, inject, fakeAsync, tick } from '@angular/core/testing';
import { NgZorroAntdModule, } from 'ng-zorro-antd';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AccountExtraAssetComponent } from './account-extra-asset.component';
import { getTranslocoModule, FakeDataHelper, FormGroupHelper } from '../../../../../testing';

describe('AccountExtraAssetComponent', () => {
  let component: AccountExtraAssetComponent;
  let fixture: ComponentFixture<AccountExtraAssetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgZorroAntdModule,
        FormsModule,
        ReactiveFormsModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        getTranslocoModule(),
      ],
      declarations: [
        AccountExtraAssetComponent,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountExtraAssetComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
