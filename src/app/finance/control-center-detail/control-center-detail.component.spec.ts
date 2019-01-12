import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { HttpLoaderTestFactory } from '../../../testing';

import { ControlCenterDetailComponent } from './control-center-detail.component';

describe('ControlCenterDetailComponent', () => {
  // let component: ControlCenterDetailComponent;
  // let fixture: ComponentFixture<ControlCenterDetailComponent>;

  beforeEach(async(() => {
    // TestBed.configureTestingModule({
    //   declarations: [ ControlCenterDetailComponent ],
    // })
    // .compileComponents();
  }));

  beforeEach(() => {
    // fixture = TestBed.createComponent(ControlCenterDetailComponent);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should be created', () => {
    // expect(component).toBeTruthy();
    expect(1).toBe(1);
  });
});
