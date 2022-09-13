import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, of, } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { NoopAnimationsModule, } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

import { FinanceUIModule } from '../../finance-ui.module';
import { getTranslocoModule, FakeDataHelper, asyncData, asyncError,
  ElementClass_DialogContent, ElementClass_DialogCloseButton } from '../../../../../testing';
import { AuthService, UIStatusService, FinanceOdataService, HomeDefOdataService, } from '../../../../services';
import { UserAuthInfo, FinanceReportByOrder, Order, FinanceReportEntryByTransactionType, } from '../../../../model';
import { MessageDialogComponent } from '../../../message-dialog';
import { StatementOfIncomeExpenseComponent } from './statement-of-income-expense.component';

xdescribe('StatementOfIncomeExpenseComponent', () => {
  let component: StatementOfIncomeExpenseComponent;
  let fixture: ComponentFixture<StatementOfIncomeExpenseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StatementOfIncomeExpenseComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StatementOfIncomeExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
