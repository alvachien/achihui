import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearnHistoryComponent } from './learn-history.component';

describe('LearnHistoryComponent', () => {
  let component: LearnHistoryComponent;
  let fixture: ComponentFixture<LearnHistoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearnHistoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearnHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
