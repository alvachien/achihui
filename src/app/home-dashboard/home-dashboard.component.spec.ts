
import { fakeAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeDashboardComponent } from './home-dashboard.component';

describe('HomeDashboardComponent', () => {
  let component: HomeDashboardComponent;
  let fixture: ComponentFixture<HomeDashboardComponent>;

  beforeEach(fakeAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should compile', () => {
    expect(component).toBeTruthy();
  });
});
