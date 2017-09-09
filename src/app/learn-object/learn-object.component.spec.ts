import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearnObjectComponent } from './learn-object.component';

describe('LearnObjectComponent', () => {
  let component: LearnObjectComponent;
  let fixture: ComponentFixture<LearnObjectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearnObjectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearnObjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
