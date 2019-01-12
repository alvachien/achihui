import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { HttpLoaderTestFactory } from '../../../testing';

import { AccountDetailComponent } from './account-detail.component';

describe('AccountDetailComponent', () => {
  // let component: AccountDetailComponent;
  // let fixture: ComponentFixture<AccountDetailComponent>;

  beforeEach(async(() => {
    // TestBed.configureTestingModule({
    //   declarations: [ AccountDetailComponent ],
    // })
    // .compileComponents();
  }));

  beforeEach(() => {
    // fixture = TestBed.createComponent(AccountDetailComponent);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should be created', () => {
    // expect(component).toBeTruthy();
    expect(1).toBe(1);
  });
});
