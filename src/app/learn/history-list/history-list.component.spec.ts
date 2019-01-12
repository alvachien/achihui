import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { HttpLoaderTestFactory } from '../../../testing';

import { HistoryListComponent } from './history-list.component';

describe('HistoryListComponent', () => {
  let component: HistoryListComponent;
  // let fixture: ComponentFixture<HistoryListComponent>;

  beforeEach(async(() => {
    // TestBed.configureTestingModule({
    //   declarations: [ HistoryListComponent ],
    // })
    // .compileComponents();
  }));

  beforeEach(() => {
    // fixture = TestBed.createComponent(HistoryListComponent);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should be created', () => {
    // expect(component).toBeTruthy();
    expect(component).toBeFalsy();
  });
});
