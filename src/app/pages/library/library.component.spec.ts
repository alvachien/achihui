import { waitForAsync, ComponentFixture, TestBed, fakeAsync, tick, inject, flush, discardPeriodicTasks } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule, } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { BehaviorSubject, of } from 'rxjs';
import { NzModalService } from 'ng-zorro-antd/modal';

import { LibraryUIModule } from './library-ui.module';
import { getTranslocoModule, FakeDataHelper, asyncData, asyncError, } from '../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService, } from '../../services';
import { UserAuthInfo, financeAccountCategoryCash, Account, AccountStatusEnum, } from '../../model';
import { MessageDialogComponent } from '../message-dialog';
import { LibraryComponent } from './library.component';

describe('LibraryComponent', () => {
  let component: LibraryComponent;
  let fixture: ComponentFixture<LibraryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        FormsModule,
        LibraryUIModule,
        ReactiveFormsModule,
        RouterTestingModule,
        NoopAnimationsModule,
        BrowserDynamicTestingModule,
        getTranslocoModule(),
      ],
      declarations: [ LibraryComponent ],
      providers: [
      ],
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
