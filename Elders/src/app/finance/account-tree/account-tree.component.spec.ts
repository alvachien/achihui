import { async, ComponentFixture, TestBed, fakeAsync, flush, inject, tick, } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { of } from 'rxjs';
import { Router, ActivatedRoute, UrlSegment } from '@angular/router';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Component, Input } from '@angular/core';
import { OverlayContainer } from '@angular/cdk/overlay';
import { By } from '@angular/platform-browser';

import { HttpLoaderTestFactory, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { AccountTreeComponent } from './account-tree.component';
import { FinanceStorageService, HomeDefDetailService, UIStatusService } from 'app/services';

@Component({selector: 'hih-fin-docitem-by-acntctgy', template: '<div>By category</div>'})
class DocumentItemByAccountCategoryComponent {
  @Input() selectedCategory: any;
  @Input() selectedAccounts: any;
  @Input() selectedScope: any;
}
@Component({selector: 'hih-fin-docitem-by-acnt', template: '<div>By account</div>'})
class DocumentItemByAccountComponent {
  @Input() selectedAccount: any;
  @Input() selectedScope: any;
}

describe('AccountTreeComponent', () => {
  let component: AccountTreeComponent;
  let fixture: ComponentFixture<AccountTreeComponent>;
  let translate: TranslateService;
  let http: HttpTestingController;
  let fakeData: FakeDataHelper;
  let fetchAllAccountCategoriesSpy: any;
  let fetchAllAccountsSpy: any;

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildFinConfigData();
    fakeData.buildFinAccounts();
    fakeData.buildChosedHome();
  });

  beforeEach(async(() => {
    const routerSpy: any = jasmine.createSpyObj('Router', ['navigate']);
    const storageService: any = jasmine.createSpyObj('FinanceStorageService', ['fetchAllAccountCategories', 'fetchAllAccounts']);
    fetchAllAccountCategoriesSpy = storageService.fetchAllAccountCategories.and.returnValue(of([]));
    fetchAllAccountsSpy = storageService.fetchAllAccounts.withArgs(false).and.returnValue(of([]))
                                                         .withArgs(true).and.returnValue(of([])) ;
    TestBed.configureTestingModule({
      imports: [
        UIDependModule,
        FormsModule,
        NoopAnimationsModule,
        HttpClientTestingModule,
        TranslateModule.forRoot({
          loader: {
            provide: TranslateLoader,
            useFactory: HttpLoaderTestFactory,
            deps: [HttpClient],
          },
        }),
      ],
      declarations: [
        DocumentItemByAccountCategoryComponent,
        DocumentItemByAccountComponent,
        AccountTreeComponent,
      ],
      providers: [
        TranslateService,
        UIStatusService,
        { provide: Router, useValue: routerSpy },
        { provide: FinanceStorageService, useValue: storageService },
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountTreeComponent);
    component = fixture.componentInstance;
  });

  it('1. should create without data', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(component.dataSource.data.length).toEqual(0);
  });

  describe('2. faked data with async loading', () => {
    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAccountsSpy.withArgs(false).and.returnValue(asyncData(fakeData.finAccounts))
                         .withArgs(true).and.returnValue(asyncData(fakeData.finAccounts));
    });

    it('should not show data before OnInit', () => {
      expect(component.dataSource.data.length).toEqual(0);
    });

    it('should show data after OnInit (fakeAsync)', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      expect(component.dataSource.data.length).toEqual(0);

      tick();
      fixture.detectChanges();

      expect(component.dataSource.data.length).toBeGreaterThan(0);
    }));
  });

  describe('3. Exception case handling (async loading)', () => {
    let overlayContainer: OverlayContainer;
    let overlayContainerElement: HTMLElement;

    beforeEach(() => {
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAccountsSpy.withArgs(false).and.returnValue(asyncData(fakeData.finAccounts))
        .withArgs(true).and.returnValue(asyncData(fakeData.finAccounts));
    });

    beforeEach(inject([OverlayContainer],
      (oc: OverlayContainer) => {
      overlayContainer = oc;
      overlayContainerElement = oc.getContainerElement();
    }));

    afterEach(() => {
      overlayContainer.ngOnDestroy();
    });

    it('should display error when Service fails', fakeAsync(() => {
      // tell spy to return an async error observable
      fetchAllAccountCategoriesSpy.and.returnValue(asyncError('Service failed'));

      fixture.detectChanges();
      tick();
      fixture.detectChanges();

      expect(overlayContainerElement.querySelectorAll('snack-bar-container').length).toBe(1);
      let messageElement: any = overlayContainerElement.querySelector('snack-bar-container')!;
      expect(messageElement.textContent).toContain('Service failed',
        'Expected snack bar to show the error message: Service failed');

      // Clean
      flush();
    }));
  });

  describe('4. Should display correct panel with the tree node click', () => {
    let treeElement: HTMLElement;
    function getNodes(treeElement2: Element): Element[] {
      return [].slice.call(treeElement2.querySelectorAll('.mat-tree-node, .mat-nested-tree-node'))!;
    }

    beforeEach(() => {
      treeElement = fixture.nativeElement.querySelector('mat-tree');
      fetchAllAccountCategoriesSpy.and.returnValue(asyncData(fakeData.finAccountCategories));
      fetchAllAccountsSpy.withArgs(false).and.returnValue(asyncData(fakeData.finAccounts))
                         .withArgs(true).and.returnValue(asyncData(fakeData.finAccounts));
    });

    it('should not show data before OnInit', () => {
      expect(component.dataSource.data.length).toEqual(0);
    });

    it('should show data after OnInit (fakeAsync)', fakeAsync(() => {
      fixture.detectChanges(); // ngOnInit()
      expect(component.dataSource.data.length).toEqual(0);

      tick();
      fixture.detectChanges();

      expect(component.dataSource.data.length).toBeGreaterThan(0);

      // // Search for the Notes
      // (getNodes(treeElement)[0] as HTMLElement).click();
      // // flush();
      // fixture.detectChanges();
      // let ctgypanel: HTMLElement = fixture.nativeElement.querySelector('hih-fin-docitem-by-acntctgy');
      // expect(ctgypanel.hasAttribute('hidden')).toEqual(false);
    }));
  });
});
