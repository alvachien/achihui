import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

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

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [FormsModule, ReactiveFormsModule, RouterTestingModule, getTranslocoModule()],
      // declarations moved to imports
      providers: [{ provide: HomeDefOdataService, useValue: homeService }],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return false for isLiteMode when member is not a Lite member', () => {
    expect(component.isLiteMode).toBe(false);
  });

  it('should return true for isLiteMode when member is a Lite member', () => {
    homeService.CurrentMemberInChosedHome!.IsLite = true;
    expect(component.isLiteMode).toBe(true);
    homeService.CurrentMemberInChosedHome!.IsLite = false;
  });

  it('should return false for isLiteMode when CurrentMemberInChosedHome is undefined', () => {
    const saved = homeService.CurrentMemberInChosedHome;
    homeService['CurrentMemberInChosedHome'] = undefined;
    expect(component.isLiteMode).toBe(false);
    homeService['CurrentMemberInChosedHome'] = saved;
  });
});
