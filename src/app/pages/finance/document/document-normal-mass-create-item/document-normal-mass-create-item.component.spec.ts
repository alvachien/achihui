import { waitForAsync, ComponentFixture, TestBed, inject, tick, fakeAsync, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NZ_I18N, en_US, } from 'ng-zorro-antd/i18n';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import * as moment from 'moment';

import { FinanceUIModule } from '../../finance-ui.module';
import { DocumentHeaderComponent } from '../document-header';
import { DocumentItemsComponent } from '../document-items';
import { getTranslocoModule, FakeDataHelper, asyncData, asyncError, } from '../../../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, FinanceOdataService } from '../../../../services';
import { UserAuthInfo, Document, DocumentItem, momentDateFormat } from '../../../../model';
import { DocumentNormalMassCreateItemComponent } from './document-normal-mass-create-item.component';

describe('DocumentNormalMassCreateItemComponent', () => {
  let component: DocumentNormalMassCreateItemComponent;
  let fixture: ComponentFixture<DocumentNormalMassCreateItemComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        FinanceUIModule,
        NoopAnimationsModule,
        RouterTestingModule,
        ReactiveFormsModule,
        getTranslocoModule(),
      ],
      declarations: [
        DocumentNormalMassCreateItemComponent,
      ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentNormalMassCreateItemComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // it('event createItemClicked shall work', () => {
  //   spyOn(component.createItemClicked, 'emit');

  //   component.fireCreateItemEvent();
  //   expect(component.createItemClicked.emit).toHaveBeenCalledWith();
  // });

  // it('event copyItemClicked shall work', () => {
  //   spyOn(component.copyItemClicked, 'emit');

  //   component.fireCopyItemEvent();
  //   expect(component.copyItemClicked.emit).toHaveBeenCalledWith();
  // });

  // it('event removeItemClicked shall work', () => {
  //   spyOn(component.removeItemClicked, 'emit');

  //   component.fireRemoveItemEvent();
  //   expect(component.removeItemClicked.emit).toHaveBeenCalledWith();
  // });
});
