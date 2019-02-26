import { async, ComponentFixture, TestBed, fakeAsync, inject, tick, flush, } from '@angular/core/testing';
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

import { HttpLoaderTestFactory, ActivatedRouteUrlStub, FakeDataHelper, asyncData, asyncError, } from '../../../testing';
import { ObjectDetailComponent } from './object-detail.component';
import { LearnStorageService, HomeDefDetailService, UIStatusService } from '../../services';
import { LearnObject } from '../../model';
import { MessageDialogComponent } from '../../message-dialog/message-dialog.component';

describe('ObjectDetailComponent', () => {
  let component: ObjectDetailComponent;
  let fixture: ComponentFixture<ObjectDetailComponent>;
  let fakeData: FakeDataHelper;
  let fetchAllCategoriesSpy: any;
  let routerSpy: any;
  let activatedRouteStub: any;
  let readObjectSpy: any;
  let createObjectSpy: any;
  let updateObjectSpy: any;

  beforeEach(async(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    fakeData.buildLearnCategories();

    routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    const homeService: Partial<HomeDefDetailService> = {};
    homeService.ChosedHome = fakeData.chosedHome;
    activatedRouteStub = new ActivatedRouteUrlStub([new UrlSegment('create', {})] as UrlSegment[]);
    const lrnStroageService: any = jasmine.createSpyObj('LearnStorageService', [
      'fetchAllCategories',
      'readObject',
      'createObject',
      'updateObject',
    ]);
    fetchAllCategoriesSpy = lrnStroageService.fetchAllCategories.and.returnValue(of([]));
    readObjectSpy = lrnStroageService.readObject.and.returnValue(of({}));
    createObjectSpy = lrnStroageService.createObject.and.returnValue(of({}));
    updateObjectSpy = lrnStroageService.updateObject.and.returnValue(of({}));

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
        ObjectDetailComponent,
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
    fixture = TestBed.createComponent(ObjectDetailComponent);
    component = fixture.componentInstance;
  });

  it('0. should be created without data', () => {
    expect(component).toBeTruthy();
  });

  describe('1. Create mode', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let curItem: LearnObject;

    beforeEach(() => {
      curItem = new LearnObject();
      curItem.CategoryId = fakeData.learnCategories[0].Id;
      curItem.Name = 'test1';
      curItem.Content = 'test1';
      curItem.Id = 2;
      createObjectSpy.and.returnValue(asyncData(curItem));

      fetchAllCategoriesSpy.and.returnValue(asyncData(fakeData.learnCategories));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('name is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.arCategories.length).toEqual(fakeData.learnCategories.length);
      expect(component.isFieldChangable).toBeTruthy();
      expect(component.detailForm.valid).toBeFalsy();

      // component.detailForm.get('nameControl').setValue(curItem.Name);
      component.detailForm.get('ctgyControl').setValue(curItem.CategoryId);
      component.detailForm.get('contentControl').setValue(curItem.Content);
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.valid).toBeFalsy();

      flush();
    }));
    it('category is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.arCategories.length).toEqual(fakeData.learnCategories.length);
      expect(component.isFieldChangable).toBeTruthy();
      expect(component.detailForm.valid).toBeFalsy();

      component.detailForm.get('nameControl').setValue(curItem.Name);
      // component.detailForm.get('ctgyControl').setValue(curItem.CategoryId);
      component.detailForm.get('contentControl').setValue(curItem.Content);
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.valid).toBeFalsy();

      flush();
    }));
    it('content is mandatory', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.arCategories.length).toEqual(fakeData.learnCategories.length);
      expect(component.isFieldChangable).toBeTruthy();
      expect(component.detailForm.valid).toBeFalsy();

      component.detailForm.get('nameControl').setValue(curItem.Name);
      component.detailForm.get('ctgyControl').setValue(curItem.CategoryId);
      // component.detailForm.get('contentControl').setValue(curItem.Content);
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.valid).toBeFalsy();

      flush();
    }));
    it('shall handle the case when cateogry failed to fetch', fakeAsync(() => {
      fetchAllCategoriesSpy.and.returnValue(asyncError('server 500'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      fixture.detectChanges();

      // expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      flush();
    }));
    it('shall allow to submit in valid case', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.detailForm.valid).toBeFalsy();

      component.detailForm.get('nameControl').setValue(curItem.Name);
      component.detailForm.get('ctgyControl').setValue(curItem.CategoryId);
      component.detailForm.get('contentControl').setValue(curItem.Content);
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.valid).toBeTruthy();

      expect(component.canSubmit()).toBeTruthy();

      flush();
    }));
    it('shall show a snackbar if create success', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.detailForm.valid).toBeFalsy();

      component.detailForm.get('nameControl').setValue(curItem.Name);
      component.detailForm.get('ctgyControl').setValue(curItem.CategoryId);
      component.detailForm.get('contentControl').setValue(curItem.Content);
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.valid).toBeTruthy();

      expect(component.canSubmit()).toBeTruthy();

      component.onSubmit();
      expect(createObjectSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();

      // Expect there is a snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).not.toBeNull();
      tick(2000);
      fixture.detectChanges();
      flush();

      expect(routerSpy.navigate).toHaveBeenCalled();

      flush();
    }));
    it('shall display an error dialog if create failed', fakeAsync(() => {
      createObjectSpy.and.returnValue(asyncError('server 500'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(component.isFieldChangable).toBeTruthy();
      expect(component.detailForm.valid).toBeFalsy();

      component.detailForm.get('nameControl').setValue(curItem.Name);
      component.detailForm.get('ctgyControl').setValue(curItem.CategoryId);
      component.detailForm.get('contentControl').setValue(curItem.Content);
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.valid).toBeTruthy();

      expect(component.canSubmit()).toBeTruthy();

      component.onSubmit();
      expect(createObjectSpy).toHaveBeenCalled();
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
    let curItem: LearnObject;

    beforeEach(() => {
      curItem = new LearnObject();
      curItem.CategoryId = fakeData.learnCategories[0].Id;
      curItem.Name = 'test1';
      curItem.Content = 'test1';
      curItem.Id = 2;
      readObjectSpy.and.returnValue(asyncData(curItem));

      fetchAllCategoriesSpy.and.returnValue(asyncData(fakeData.learnCategories));
      updateObjectSpy.and.returnValue(asyncData(curItem));

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

    it('shall show a dialog if read object failed', fakeAsync(() => {
      readObjectSpy.and.returnValue(asyncError('server 500 error'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(readObjectSpy).toHaveBeenCalled();
      // Expect there is a dialog
      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(1);
      // Since there is only one button
      (overlayContainerElement.querySelector('button') as HTMLElement).click();
      fixture.detectChanges();
      flush();

      expect(overlayContainerElement.querySelectorAll('.mat-dialog-container').length).toBe(0);

      flush();
    }));
    it('shall show a snackbar if change succeed', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(readObjectSpy).toHaveBeenCalled();
      expect(component.isFieldChangable).toBeTruthy();

      expect(component.detailForm.get('nameControl').value).toEqual(curItem.Name);
      expect(component.detailForm.get('ctgyControl').value).toEqual(curItem.CategoryId);
      expect(component.detailForm.get('contentControl').value).toEqual(curItem.Content);

      component.detailForm.get('nameControl').setValue('');
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.valid).toBeFalsy();
      expect(component.canSubmit()).toBeFalsy();

      component.detailForm.get('nameControl').setValue('test 2');
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.valid).toBeTruthy();
      expect(component.canSubmit()).toBeTruthy();

      component.onSubmit();
      expect(updateObjectSpy).toHaveBeenCalled();
      tick();
      fixture.detectChanges();

      // Expect there is a snackbar
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).not.toBeNull();
      tick(2000);
      fixture.detectChanges();
      flush();

      expect(routerSpy.navigate).toHaveBeenCalled();

      flush();
    }));
    it('shall display an error dialog if change failed', fakeAsync(() => {
      updateObjectSpy.and.returnValue(asyncError('server 500'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(readObjectSpy).toHaveBeenCalled();
      expect(component.isFieldChangable).toBeTruthy();

      expect(component.detailForm.get('nameControl').value).toEqual(curItem.Name);
      expect(component.detailForm.get('ctgyControl').value).toEqual(curItem.CategoryId);
      expect(component.detailForm.get('contentControl').value).toEqual(curItem.Content);

      component.detailForm.get('nameControl').setValue('test 2');
      component.detailForm.updateValueAndValidity();
      expect(component.detailForm.valid).toBeTruthy();
      expect(component.canSubmit()).toBeTruthy();

      component.onSubmit();
      expect(updateObjectSpy).toHaveBeenCalled();
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
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;
    let curItem: LearnObject;

    beforeEach(() => {
      curItem = new LearnObject();
      curItem.CategoryId = fakeData.learnCategories[0].Id;
      curItem.Name = 'test1';
      curItem.Content = 'test1';
      curItem.Id = 2;
      readObjectSpy.and.returnValue(asyncData(curItem));

      fetchAllCategoriesSpy.and.returnValue(asyncData(fakeData.learnCategories));

      activatedRouteStub.setURL([new UrlSegment('display', {}), new UrlSegment('2', {})] as UrlSegment[]);
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('shall load the data and set the status correctly', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(readObjectSpy).toHaveBeenCalled();
      expect(component.isFieldChangable).toBeFalsy();
      expect(component.canSubmit()).toBeFalsy();
      expect(component.detailForm.disabled).toBeTruthy();

      flush();
    }));
    it('shall show a dialog if read object failed', fakeAsync(() => {
      readObjectSpy.and.returnValue(asyncError('server 500 error'));

      fixture.detectChanges(); // ngOnInit
      tick(); // Complete the Observables in ngOnInit
      fixture.detectChanges();

      expect(readObjectSpy).toHaveBeenCalled();
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
});
