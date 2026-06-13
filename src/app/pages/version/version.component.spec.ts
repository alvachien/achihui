import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NzTimelineModule } from 'ng-zorro-antd/timeline';

import { getTranslocoModule } from '../../../testing';
import { VersionComponent } from './version.component';

describe('VersionComponent', () => {
  let component: VersionComponent;
  let fixture: ComponentFixture<VersionComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [NzTimelineModule, getTranslocoModule()],
      // declarations moved to imports
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VersionComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
