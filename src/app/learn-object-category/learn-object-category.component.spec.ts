import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearnObjectCategoryComponent } from './learn-object-category.component';

describe('LearnObjectCategoryComponent', () => {
  let component: LearnObjectCategoryComponent;
  let fixture: ComponentFixture<LearnObjectCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearnObjectCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearnObjectCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
