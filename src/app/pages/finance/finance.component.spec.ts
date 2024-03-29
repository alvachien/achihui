import { waitForAsync, ComponentFixture, TestBed, inject, tick, fakeAsync, flush } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import * as moment from 'moment';

import { FinanceUIModule } from './finance-ui.module';
import {
  getTranslocoModule,
  FakeDataHelper,
  asyncError,
  ElementClass_DialogContent,
  ElementClass_DialogCloseButton,
} from '../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, FinanceOdataService } from '../../services';
import { UserAuthInfo, momentDateFormat, TemplateDocADP, TemplateDocLoan } from '../../model';
import { FinanceComponent } from './finance.component';
import { SafeAny } from 'src/common';

describe('FinanceComponent', () => {
  let component: FinanceComponent;
  let fixture: ComponentFixture<FinanceComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllDPTmpDocsSpy: SafeAny;
  let fetchAllLoanTmpDocsSpy: SafeAny;
  let createDocumentFromDPTemplateSpy: SafeAny;
  let fetchOverviewKeyfigureSpy: SafeAny;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildChosedHome();
    fakeData.buildCurrentUser();
  });

  beforeEach(waitForAsync(() => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const homeService: Partial<HomeDefOdataService> = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };

    const odataService: SafeAny = jasmine.createSpyObj('FinanceOdataService', [
      'fetchAllDPTmpDocs',
      'fetchAllLoanTmpDocs',
      'createDocumentFromDPTemplate',
      'fetchOverviewKeyfigure',
    ]);
    fetchAllDPTmpDocsSpy = odataService.fetchAllDPTmpDocs.and.returnValue([]);
    fetchAllLoanTmpDocsSpy = odataService.fetchAllLoanTmpDocs.and.returnValue([]);
    createDocumentFromDPTemplateSpy = odataService.createDocumentFromDPTemplate.and.returnValue();
    fetchOverviewKeyfigureSpy = odataService.fetchOverviewKeyfigure.and.returnValue(of({}));

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
      declarations: [FinanceComponent],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: FinanceOdataService, useValue: odataService },
        { provide: NZ_I18N, useValue: en_US },
        NzModalService,
      ],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Working with data', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let arDPTmpDoc: TemplateDocADP[] = [];
    let arLoanTmpDoc: TemplateDocLoan[] = [];

    beforeEach(() => {
      fetchAllDPTmpDocsSpy.and.returnValue(of(arDPTmpDoc));
      fetchAllLoanTmpDocsSpy.and.returnValue(of(arLoanTmpDoc));
      createDocumentFromDPTemplateSpy.and.returnValue(of({}));
      fetchOverviewKeyfigureSpy.and.returnValue(of({}));
    });

    beforeEach(inject([OverlayContainer], (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('Should work if there is no data', fakeAsync(() => {
      arLoanTmpDoc = [];
      arDPTmpDoc = [];
      fetchAllDPTmpDocsSpy.and.returnValue(of(arDPTmpDoc));
      fetchAllLoanTmpDocsSpy.and.returnValue(of(arLoanTmpDoc));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.listDate.length).toEqual(0); // Empty list

      flush();
    }));

    it('Should work for DP and Loan docs', fakeAsync(() => {
      const dat1 = moment().startOf('month');
      const dat2 = moment().endOf('month');
      arLoanTmpDoc = [];
      arDPTmpDoc = [];
      const dp1: TemplateDocADP = new TemplateDocADP();
      dp1.DocId = 1;
      dp1.HID = fakeData.chosedHome.ID;
      dp1.TranAmount = 100;
      dp1.TranDate = dat1.clone();
      dp1.AccountId = 1;
      dp1.Desp = 'test1';
      arDPTmpDoc.push(dp1);
      const dp2 = new TemplateDocADP();
      dp2.HID = fakeData.chosedHome.ID;
      dp2.DocId = 2;
      dp2.TranAmount = 200;
      dp2.TranDate = dat2.clone();
      dp2.AccountId = 1;
      dp2.Desp = 'test2';
      arDPTmpDoc.push(dp2);
      const loan1: TemplateDocLoan = new TemplateDocLoan();
      loan1.HID = fakeData.chosedHome.ID;
      loan1.Desp = 'Loan 1';
      loan1.TranDate = dat2.clone();
      loan1.DocId = 3;
      loan1.AccountId = 1;
      loan1.TranAmount = 300;
      arLoanTmpDoc.push(loan1);
      fetchAllDPTmpDocsSpy.and.returnValue(of(arDPTmpDoc));
      fetchAllLoanTmpDocsSpy.and.returnValue(of(arLoanTmpDoc));
      createDocumentFromDPTemplateSpy.and.returnValue(
        of({
          TranDate: dat1.clone(),
        })
      );
      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(component.listDate.length).toEqual(2); // Shall be two dates

      // And then, change the date
      component.onSelectChange(null);
      // It shall not fetch data again

      // Then do the DP posting
      component.doPostDPDoc(dp1);
      expect(createDocumentFromDPTemplateSpy).toHaveBeenCalled();
      expect(component.listDate.length).toEqual(1);
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      expect(component.listDate[0].CurrentDate!.format(momentDateFormat)).toEqual(dat2.format(momentDateFormat));

      // Post the Loan doc
      const routerstub = TestBed.inject(Router);
      spyOn(routerstub, 'navigate');
      component.doPostLoanDoc(loan1);

      expect(routerstub.navigate).toHaveBeenCalled();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createloanrepay/3']);

      flush();
    }));

    it('should popup error dialog if fetchAllDPTmpDocs fails', fakeAsync(() => {
      fetchAllDPTmpDocsSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));

    it('should popup error dialog if fetchAllLoanTmpDocs fails', fakeAsync(() => {
      fetchAllLoanTmpDocsSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      flush();

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      flush();
      tick();
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      flush();
    }));
  });
});
