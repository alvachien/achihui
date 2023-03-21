import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NzListModule } from 'ng-zorro-antd/list';

import { getTranslocoModule } from '../../../testing';
import { CreditsComponent } from './credits.component';

describe('CreditsComponent', () => {
  let component: CreditsComponent;
  let fixture: ComponentFixture<CreditsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      imports: [NzListModule, getTranslocoModule()],
      declarations: [CreditsComponent],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreditsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('credits', () => {
    expect(component.creditApp.length).toBeGreaterThan(0);
  });
});
