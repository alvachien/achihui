import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeDefDetailComponent } from './home-def-detail.component';

describe('HomeDefDetailComponent', () => {
  let component: HomeDefDetailComponent;
  let fixture: ComponentFixture<HomeDefDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeDefDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeDefDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
