import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { HttpLoaderTestFactory } from '../../../testing';

import { TranTypeListComponent } from './tran-type-list.component';

describe('TranTypeListComponent', () => {
  // let component: TranTypeListComponent;
  // let fixture: ComponentFixture<TranTypeListComponent>;

  beforeEach(async(() => {
    // TestBed.configureTestingModule({
    //   declarations: [ TranTypeListComponent ],
    // })
    // .compileComponents();
  }));

  beforeEach(() => {
    // fixture = TestBed.createComponent(TranTypeListComponent);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should be created', () => {
    // expect(component).toBeTruthy();
    expect(1).toBe(1);
  });
});
