import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { RouterTestingModule } from '@angular/router/testing';

import { getTranslocoModule } from '../../../testing';
import { environment } from '../../../environments/environment';
import { AboutComponent } from './about.component';
import { UIStatusService } from '../../services';

describe('AboutComponent', () => {
  let component: AboutComponent;
  let fixture: ComponentFixture<AboutComponent>;

  beforeEach(async () => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule, NzDividerModule, getTranslocoModule()],
      // declarations moved to imports
      providers: [UIStatusService],
    }).compileComponents();
  });

  beforeEach(() => {
    const uisrv = TestBed.inject(UIStatusService);
    uisrv.versionResult = {
      APIVersion: '1.8',
      StorageVersion: '16',
    };
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('check current version', () => {
    const compiled = fixture.debugElement.nativeElement;
    const p = compiled.querySelector('#curversion');
    expect(p.textContent.trim()).toEqual(environment.CurrentVersion.trim());
  });

  // Regression: versionResult is null until AppComponent's async checkDBVersion()
  // resolves (or forever if the user isn't authorized). The template must not
  // throw when the value is still null. Previously `resultVersion()!.APIVersion`
  // threw TypeError: Cannot read properties of null (reading 'APIVersion').
  it('renders without throwing when versionResult is null', () => {
    const uisrv = TestBed.inject(UIStatusService);
    uisrv.versionResult = null;
    fixture.destroy();
    fixture = TestBed.createComponent(AboutComponent);
    component = fixture.componentInstance;
    expect(() => fixture.detectChanges()).not.toThrow();
  });
});
