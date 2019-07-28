import { async, ComponentFixture, TestBed, fakeAsync, tick, flush, inject, } from '@angular/core/testing';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router, UrlSegment, ActivatedRoute, } from '@angular/router';
import { of } from 'rxjs';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';

import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';
import { HttpLoaderTestFactory, ActivatedRouteUrlStub, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { QuestionBankDetailComponent } from './question-bank-detail.component';
import { LearnStorageService, HomeDefDetailService, UIStatusService } from '../../services';
import { QuestionBankTypeEnum, QuestionBankItem, } from 'app/model';

describe('QuestionBankDetailComponent', () => {
  let component: QuestionBankDetailComponent;
  let fixture: ComponentFixture<QuestionBankDetailComponent>;
  let fakeData: FakeDataHelper;
  let readQuestionBankSpy: any;
  let createQuestionBankItemSpy: any;
  let updateQuestionBankItemSpy: any;
  let activatedRouteStub: any;
  let routerSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const homeService: Partial<HomeDefDetailService> = {};
    homeService.ChosedHome = fakeData.chosedHome;
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);
    const lrnStroageService: any = jasmine.createSpyObj('LearnStorageService', [
      'readQuestionBank',
      'createQuestionBankItem',
      'updateQuestionBankItem',
    ]);
    readQuestionBankSpy = lrnStroageService.readQuestionBank.and.returnValue(of({}));
    createQuestionBankItemSpy = lrnStroageService.createQuestionBankItem.and.returnValue(of({}));
    updateQuestionBankItemSpy = lrnStroageService.updateQuestionBankItem.and.returnValue(of({}));

    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientTestingModule,
        NoopAnimationsModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient],
          },
        }),
      ],
      declarations: [
        QuestionBankDetailComponent,
        MessageDialogComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: Router, useValue: routerSpy },
        { provide: HomeDefDetailService, useValue: homeService },
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: LearnStorageService, useValue: lrnStroageService },
      ],
    });

    TestBed.overrideModule(BrowserDynamicTestingModule, {
      set: {
        entryComponents: [ MessageDialogComponent ],
      },
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(QuestionBankDetailComponent);
    component = fixture.componentInstance;
  });

  it('0. should be created without data', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  describe('1. Create mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let curItem: QuestionBankItem;

    beforeEach(() => {
      curItem = new QuestionBankItem();
      curItem.QBType = QuestionBankTypeEnum.EssayQuestion;
      curItem.Question = 'qtn1';
      curItem.BriefAnswer = 'brw1';
      curItem.ID = 1;
      createQuestionBankItemSpy.and.returnValue(asyncData(curItem));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('type is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.detailForm.valid).toBeFalsy();
      expect(component.dataSourceSub.data.length).toEqual(0);

      // component.detailForm.get('typeControl').setValue(QuestionBankTypeEnum.EssayQuestion);
      component.detailForm.get('questionControl').setValue('quest1');
      component.detailForm.get('briefAnswerControl').setValue('awr1');
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.valid).toBeFalsy();
    }));
    it('question is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.detailForm.valid).toBeFalsy();
      expect(component.dataSourceSub.data.length).toEqual(0);

      component.detailForm.get('typeControl').setValue(QuestionBankTypeEnum.EssayQuestion);
      // component.detailForm.get('questionControl').setValue('quest1');
      component.detailForm.get('briefAnswerControl').setValue('awr1');
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.valid).toBeFalsy();
    }));
    it('brief answer is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.detailForm.valid).toBeFalsy();
      expect(component.dataSourceSub.data.length).toEqual(0);

      component.detailForm.get('typeControl').setValue(QuestionBankTypeEnum.EssayQuestion);
      component.detailForm.get('questionControl').setValue('quest1');
      // component.detailForm.get('briefAnswerControl').setValue('awr1');
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.valid).toBeFalsy();
    }));
    it('Sub items are mandatory for choice case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.detailForm.valid).toBeFalsy();
      expect(component.dataSourceSub.data.length).toEqual(0);

      component.detailForm.get('typeControl').setValue(QuestionBankTypeEnum.MultipleChoice);
      component.detailForm.get('questionControl').setValue('quest1');
      component.detailForm.get('briefAnswerControl').setValue('awr1');
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.valid).toBeTruthy();
      expect(component.canSubmit()).toBeFalsy();
    }));
    it('shall allow to submit for valid essay case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.detailForm.valid).toBeFalsy();
      expect(component.dataSourceSub.data.length).toEqual(0);

      component.detailForm.get('typeControl').setValue(QuestionBankTypeEnum.EssayQuestion);
      component.detailForm.get('questionControl').setValue('quest1');
      component.detailForm.get('briefAnswerControl').setValue('awr1');
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.valid).toBeTruthy();
      expect(component.canSubmit()).toBeTruthy();
    }));
    it('shall handle successful create scenario for valid essay case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.detailForm.valid).toBeFalsy();
      expect(component.dataSourceSub.data.length).toEqual(0);

      component.detailForm.get('typeControl').setValue(QuestionBankTypeEnum.EssayQuestion);
      component.detailForm.get('questionControl').setValue('quest1');
      component.detailForm.get('briefAnswerControl').setValue('awr1');
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.valid).toBeTruthy();
      expect(component.canSubmit()).toBeTruthy();

      component.onSubmit();
      expect(createQuestionBankItemSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();

      // Expect there is a snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).not.toBeNull();
      tick(2000);
      fixture.detectChanges();
      expect(routerSpy.navigate).toHaveBeenCalled();

      flush();
    }));
    it('shall handle failed create scenario for valid essay case', fakeAsync(() => {
      createQuestionBankItemSpy.and.returnValue(asyncError('server 500 fail'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.detailForm.valid).toBeFalsy();
      expect(component.dataSourceSub.data.length).toEqual(0);

      component.detailForm.get('typeControl').setValue(QuestionBankTypeEnum.EssayQuestion);
      component.detailForm.get('questionControl').setValue('quest1');
      component.detailForm.get('briefAnswerControl').setValue('awr1');
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.valid).toBeTruthy();
      expect(component.canSubmit()).toBeTruthy();

      component.onSubmit();
      expect(createQuestionBankItemSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      fixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      flush();
    }));
  });
  describe('2. Change mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let curItem: QuestionBankItem;

    beforeEach(() => {
      curItem = new QuestionBankItem();
      curItem.QBType = QuestionBankTypeEnum.EssayQuestion;
      curItem.Question = 'qtn1';
      curItem.BriefAnswer = 'brw1';
      curItem.ID = 2;
      readQuestionBankSpy.and.returnValue(asyncData(curItem));
      updateQuestionBankItemSpy.and.returnValue(asyncData(curItem));

      activatedRouteStub.setURL([new UrlSegment('edit', {}), new UrlSegment('2', {})] as UrlSegment[]);
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall read out the item', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(readQuestionBankSpy).toHaveBeenCalled();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.detailForm.valid).toBeTruthy();
      expect(component.detailForm.get('typeControl').value).toEqual(curItem.QBType);
      expect(component.detailForm.get('questionControl').value).toEqual(curItem.Question);
      expect(component.detailForm.get('briefAnswerControl').value).toEqual(curItem.BriefAnswer);
    }));

    it('type is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.detailForm.valid).toBeTruthy();
      expect(component.dataSourceSub.data.length).toEqual(0);

      component.detailForm.get('typeControl').setValue('');
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.valid).toBeFalsy();
    }));
    it('question is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.detailForm.valid).toBeTruthy();
      expect(component.dataSourceSub.data.length).toEqual(0);

      component.detailForm.get('questionControl').setValue('');
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.valid).toBeFalsy();
    }));
    it('brief answer is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.detailForm.valid).toBeTruthy();
      expect(component.dataSourceSub.data.length).toEqual(0);

      component.detailForm.get('briefAnswerControl').setValue('');
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.valid).toBeFalsy();
    }));
    it('Sub items are mandatory for choice case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.detailForm.valid).toBeTruthy();
      expect(component.dataSourceSub.data.length).toEqual(0);

      component.detailForm.get('typeControl').setValue(QuestionBankTypeEnum.MultipleChoice);
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.valid).toBeTruthy();
      expect(component.canSubmit()).toBeFalsy();
    }));
    it('shall allow to submit for valid essay case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit

      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.detailForm.valid).toBeTruthy();
      expect(component.dataSourceSub.data.length).toEqual(0);

      component.detailForm.get('questionControl').setValue('quest2');
      component.detailForm.get('questionControl').markAsDirty();
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.dirty).toBeTruthy();

      expect(component.detailForm.valid).toBeTruthy();
      expect(component.canSubmit()).toBeTruthy();
    }));
    it('shall handle successful change scenario for valid essay case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.detailForm.valid).toBeTruthy();
      expect(component.dataSourceSub.data.length).toEqual(0);

      component.detailForm.get('questionControl').setValue('quest2');
      component.detailForm.get('briefAnswerControl').setValue('awr1');
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.valid).toBeTruthy();
      expect(component.canSubmit()).toBeTruthy();

      component.onSubmit();
      expect(updateQuestionBankItemSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();

      // Expect there is a snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).not.toBeNull();
      tick(2000);
      fixture.detectChanges();
      expect(routerSpy.navigate).toHaveBeenCalled();

      flush();
    }));
    it('shall handle failed create scenario for valid essay case', fakeAsync(() => {
      updateQuestionBankItemSpy.and.returnValue(asyncError('server 500 fail'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.detailForm.valid).toBeTruthy();
      expect(component.dataSourceSub.data.length).toEqual(0);

      component.detailForm.get('questionControl').setValue('quest2');
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.valid).toBeTruthy();
      expect(component.canSubmit()).toBeTruthy();

      component.onSubmit();
      expect(updateQuestionBankItemSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      fixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      flush();
    }));
  });
  describe('3. Display mode', () => {
    let curItem: QuestionBankItem;

    beforeEach(() => {
      curItem = new QuestionBankItem();
      curItem.QBType = QuestionBankTypeEnum.EssayQuestion;
      curItem.Question = 'qtn1';
      curItem.BriefAnswer = 'brw1';
      curItem.ID = 2;
      readQuestionBankSpy.and.returnValue(asyncData(curItem));
      updateQuestionBankItemSpy.and.returnValue(asyncData(curItem));

      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('2', {})] as UrlSegment[]);
    });

    it('shall read out the item', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(readQuestionBankSpy).toHaveBeenCalled();

      expect(component.isFieldChangable).toBeFalsy();
      expect(component.detailForm.get('typeControl').value).toEqual(curItem.QBType);
      expect(component.detailForm.get('questionControl').value).toEqual(curItem.Question);
      expect(component.detailForm.get('briefAnswerControl').value).toEqual(curItem.BriefAnswer);
      expect(component.detailForm.enabled).toBeFalsy();
    }));
  });
});
