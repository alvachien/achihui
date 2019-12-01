import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeDefComponent } from './home-def.component';

describe('HomeDefComponent', () => {
  let component: HomeDefComponent;
  let fixture: ComponentFixture<HomeDefComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeDefComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomeDefComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
