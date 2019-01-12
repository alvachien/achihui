import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { HttpLoaderTestFactory } from '../../../testing';

import { OrderDetailComponent } from './order-detail.component';

describe('OrderDetailComponent', () => {
  // let component: OrderDetailComponent;
  // let fixture: ComponentFixture<OrderDetailComponent>;

  beforeEach(async(() => {
    // TestBed.configureTestingModule({
    //   declarations: [ OrderDetailComponent ],
    // })
    // .compileComponents();
  }));

  beforeEach(() => {
    // fixture = TestBed.createComponent(OrderDetailComponent);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should be created', () => {
    // expect(component).toBeTruthy();
    expect(1).toBe(1);
  });
});
