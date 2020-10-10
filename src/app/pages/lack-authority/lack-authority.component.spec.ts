import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';

import { LackAuthorityComponent } from './lack-authority.component';
import { getTranslocoModule, FakeDataHelper, asyncData, asyncError } from '../../../testing';

describe('LackAuthorityComponent', () => {
  let component: LackAuthorityComponent;
  let fixture: ComponentFixture<LackAuthorityComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [
        getTranslocoModule(),
      ],
      declarations: [
        LackAuthorityComponent,
      ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LackAuthorityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
