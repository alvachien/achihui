import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzCarouselModule } from 'ng-zorro-antd/carousel';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { getTranslocoModule } from '../../../testing';
import { WelcomeComponent } from './welcome.component';

describe('WelcomeComponent', () => {
  let component: WelcomeComponent;
  let fixture: ComponentFixture<WelcomeComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        NzCarouselModule,
        NzTypographyModule,
        NzGridModule,
        NzDividerModule,
        NzCardModule,
        NzImageModule,
        RouterTestingModule,
        getTranslocoModule(),
      ],
      declarations: [WelcomeComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WelcomeComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    let imgurl = component.accountImage;
    expect(imgurl).toMatch('Accounts.png');

    imgurl = component.documentImage;
    expect(imgurl).toMatch('Documents.png');

    imgurl = component.reportImage;
    expect(imgurl).toMatch('Reports.png');

    imgurl = component.overviewImage;
    expect(imgurl).toMatch('Overview.png');

    imgurl = component.planImage;
    expect(imgurl).toMatch('Plan.png');

    imgurl = component.configImage;
    expect(imgurl).toMatch('Config.png');
  });

  it('navigation to overview', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');

    component.onNavigateToOverview();
    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['finance', 'overview']);
  });

  it('navigation to account', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');

    component.onNavigateToAccount();
    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['finance', 'account']);
  });

  it('navigation to document', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');

    component.onNavigateToDocument();
    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['finance', 'document']);
  });

  it('navigation to report', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');

    component.onNavigateToReport();
    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['finance', 'report']);
  });

  it('navigation to plan', () => {
    const routerstub = TestBed.inject(Router);
    spyOn(routerstub, 'navigate');

    component.onNavigateToPlan();
    expect(routerstub.navigate).toHaveBeenCalled();
    expect(routerstub.navigate).toHaveBeenCalledWith(['finance', 'plan']);
  });
});
