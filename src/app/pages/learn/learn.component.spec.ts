import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearnUIModule } from './learn-ui.module';
import { LearnComponent } from './learn.component';

describe('LearnComponent', () => {
  let component: LearnComponent;
  let fixture: ComponentFixture<LearnComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        LearnUIModule,
      ],
      declarations: [ LearnComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
