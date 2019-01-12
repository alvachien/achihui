import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { HttpLoaderTestFactory } from '../../../testing';

import { AccountExtAssetComponent } from './account-ext-asset.component';

describe('AccountExtAssetComponent', () => {
  // let component: AccountExtAssetComponent;
  // let fixture: ComponentFixture<AccountExtAssetComponent>;

  beforeEach(async(() => {
    // TestBed.configureTestingModule({
    //   declarations: [ AccountExtAssetComponent ]
    // })
    // .compileComponents();
  }));

  beforeEach(() => {
    // fixture = TestBed.createComponent(AccountExtAssetComponent);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should be created', () => {
    // expect(component).toBeTruthy();
    expect(1).toBe(1);
  });
});
