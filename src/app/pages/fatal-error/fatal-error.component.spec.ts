import { waitForAsync, ComponentFixture, TestBed } from '@angular/core/testing';
import { NzResultModule } from 'ng-zorro-antd/result';

import { FatalErrorComponent } from './fatal-error.component';
import { getTranslocoModule } from '../../../testing';
import { UIStatusService } from '../../services';

describe('FatalErrorComponent', () => {
  let component: FatalErrorComponent;
  let fixture: ComponentFixture<FatalErrorComponent>;
  const uiServiceStub: Partial<UIStatusService> = {};

  beforeEach(waitForAsync(() => {
    uiServiceStub.latestError = '';

    TestBed.configureTestingModule({
      imports: [NzResultModule, getTranslocoModule()],
      declarations: [FatalErrorComponent],
      providers: [{ provide: UIStatusService, useValue: uiServiceStub }],
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FatalErrorComponent);
    component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display last error', () => {
    uiServiceStub.latestError = 'error';
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });
});
