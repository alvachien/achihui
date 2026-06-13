import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NzModalService } from 'ng-zorro-antd/modal';
import { BehaviorSubject, of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { startOfMonth, endOfMonth, format } from 'date-fns';

import {
  createSpyObj,
  getTranslocoModule,
  FakeDataHelper,
  asyncError,
  ElementClass_DialogContent,
  ElementClass_DialogCloseButton,
} from '../../../testing';
import { AuthService, UIStatusService, HomeDefOdataService, FinanceOdataService } from '../../services';
import { UserAuthInfo, dateFormat, TemplateDocADP, TemplateDocLoan } from '../../model';
import { FinanceComponent } from './finance.component';
import { SafeAny } from '@common/any';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

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

  beforeEach(async () => {
    const authServiceStub: Partial<AuthService> = {};
    authServiceStub.authSubject = new BehaviorSubject(new UserAuthInfo());
    const homeService: Partial<HomeDefOdataService> = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };

    const odataService: SafeAny = createSpyObj('FinanceOdataService', [
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
      // declarations moved to imports
      imports: [FormsModule, NoopAnimationsModule, RouterTestingModule, ReactiveFormsModule, getTranslocoModule()],
      providers: [
        { provide: AuthService, useValue: authServiceStub },
        UIStatusService,
        { provide: HomeDefOdataService, useValue: homeService },
        { provide: FinanceOdataService, useValue: odataService },
        { provide: NZ_I18N, useValue: en_US },
        NzModalService,
        provideHttpClient(withInterceptorsFromDi()),
        provideHttpClientTesting(),
      ],
    }).compileComponents();
  });

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

    beforeEach(() => {
      const oc: OverlayContainer = TestBed.inject(OverlayContainer);
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    });

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('Should work if there is no data', async () => {
      arLoanTmpDoc = [];
      arDPTmpDoc = [];
      fetchAllDPTmpDocsSpy.and.returnValue(of(arDPTmpDoc));
      fetchAllLoanTmpDocsSpy.and.returnValue(of(arLoanTmpDoc));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      expect(component.listDate.length).toEqual(0); // Empty list

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('Should work for DP and Loan docs', async () => {
      const dat1 = startOfMonth(new Date());
      const dat2 = endOfMonth(new Date());
      arLoanTmpDoc = [];
      arDPTmpDoc = [];
      const dp1: TemplateDocADP = new TemplateDocADP();
      dp1.DocId = 1;
      dp1.HID = fakeData.chosedHome.ID;
      dp1.TranAmount = 100;
      dp1.TranDate = dat1;
      dp1.AccountId = 1;
      dp1.Desp = 'test1';
      arDPTmpDoc.push(dp1);
      const dp2 = new TemplateDocADP();
      dp2.HID = fakeData.chosedHome.ID;
      dp2.DocId = 2;
      dp2.TranAmount = 200;
      dp2.TranDate = new Date(dat2);
      dp2.AccountId = 1;
      dp2.Desp = 'test2';
      arDPTmpDoc.push(dp2);
      const loan1: TemplateDocLoan = new TemplateDocLoan();
      loan1.HID = fakeData.chosedHome.ID;
      loan1.Desp = 'Loan 1';
      loan1.TranDate = new Date(dat2);
      loan1.DocId = 3;
      loan1.AccountId = 1;
      loan1.TranAmount = 300;
      arLoanTmpDoc.push(loan1);
      fetchAllDPTmpDocsSpy.and.returnValue(of(arDPTmpDoc));
      fetchAllLoanTmpDocsSpy.and.returnValue(of(arLoanTmpDoc));
      createDocumentFromDPTemplateSpy.and.returnValue(
        of({
          TranDate: new Date(dat1),
        }),
      );
      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
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
      expect(format(component.listDate[0].CurrentDate!, dateFormat)).toEqual(format(dat2, dateFormat));

      // Post the Loan doc
      const routerstub = TestBed.inject(Router);
      vi.spyOn(routerstub, 'navigate');
      component.doPostLoanDoc(loan1);

      expect(routerstub.navigate).toHaveBeenCalled();
      expect(routerstub.navigate).toHaveBeenCalledWith(['/finance/document/createloanrepay/3']);

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('should popup error dialog if fetchAllDPTmpDocs fails', async () => {
      fetchAllDPTmpDocsSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>((r) => setTimeout(r, 0));
    });

    it('should popup error dialog if fetchAllLoanTmpDocs fails', async () => {
      fetchAllLoanTmpDocsSpy.and.returnValue(asyncError('failed'));

      fixture.detectChanges();
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(1);
      await new Promise<void>((r) => setTimeout(r, 0));

      // OK button
      const closeBtn = overlayContainerElement.querySelector(ElementClass_DialogCloseButton) as HTMLButtonElement;
      expect(closeBtn).toBeTruthy();
      closeBtn.click();
      await new Promise<void>((r) => setTimeout(r, 0));
      await new Promise<void>((r) => setTimeout(r, 0));
      fixture.detectChanges();
      expect(overlayContainerElement.querySelectorAll(ElementClass_DialogContent).length).toBe(0);

      await new Promise<void>((r) => setTimeout(r, 0));
    });
  });
});
