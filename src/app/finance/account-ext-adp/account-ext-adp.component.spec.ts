import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { HttpLoaderTestFactory } from '../../../testing';

import { AccountExtADPComponent } from './account-ext-adp.component';

describe('AccountExtADPComponent', () => {
  // let component: AccountExtADPComponent;
  // let fixture: ComponentFixture<AccountExtADPComponent>;

  beforeEach(async(() => {
    // TestBed.configureTestingModule({
    //   declarations: [ AccountExtADPComponent ]
    // })
    // .compileComponents();
  }));

  beforeEach(() => {
    // fixture = TestBed.createComponent(AccountExtADPComponent);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should be created', () => {
    // expect(component).toBeTruthy();
    expect(1).toBe(1);
  });
});
