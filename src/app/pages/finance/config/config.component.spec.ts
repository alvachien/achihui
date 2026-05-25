import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AccountCategoryListComponent } from './account-category-list';
import { AssetCategoryListComponent } from './asset-category-list';
import { DocTypeListComponent } from './doc-type-list';
import { TranTypeHierarchyComponent } from './tran-type-hierarchy';
import { TranTypeListComponent } from './tran-type-list';
import { ConfigComponent } from './config.component';
import { getTranslocoModule, FakeDataHelper } from '../../../../testing';
import { HomeDefOdataService } from '../../../services';

describe('ConfigComponent', () => {
  let component: ConfigComponent;
  let fixture: ComponentFixture<ConfigComponent>;
  let fakeData: FakeDataHelper;
  let homeService: Partial<HomeDefOdataService> = {};

  beforeAll(() => {
    fakeData = new FakeDataHelper();
    fakeData.buildCurrencies();
    fakeData.buildCurrentUser();
    fakeData.buildChosedHome();
    homeService = {
      ChosedHome: fakeData.chosedHome,
      MembersInChosedHome: fakeData.chosedHome.Members,
      CurrentMemberInChosedHome: fakeData.chosedHome.Members[0],
    };
  });

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, getTranslocoModule()],
      // declarations moved to imports
      providers: [{ provide: HomeDefOdataService, useValue: homeService }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return false for isChildMode when member is not a child', () => {
    expect(component.isChildMode).toBeFalse();
  });

  it('should return true for isChildMode when member is a child', () => {
    homeService.CurrentMemberInChosedHome!['IsChild'] = true;
    expect(component.isChildMode).toBeTrue();
    homeService.CurrentMemberInChosedHome!['IsChild'] = false;
  });

  it('should return false for isChildMode when CurrentMemberInChosedHome is undefined', () => {
    const saved = homeService.CurrentMemberInChosedHome;
    homeService['CurrentMemberInChosedHome'] = undefined;
    expect(component.isChildMode).toBeFalse();
    homeService['CurrentMemberInChosedHome'] = saved;
  });
});
