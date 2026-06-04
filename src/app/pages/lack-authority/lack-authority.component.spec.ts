import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NzResultModule } from 'ng-zorro-antd/result';
import { NzButtonModule } from 'ng-zorro-antd/button';

import { LackAuthorityComponent } from './lack-authority.component';
import { getTranslocoModule } from '../../../testing';

describe('LackAuthorityComponent', () => {
  let component: LackAuthorityComponent;
  let fixture: ComponentFixture<LackAuthorityComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [NzResultModule, NzButtonModule, getTranslocoModule()],
      // declarations moved to imports
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LackAuthorityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
