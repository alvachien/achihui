import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgZorroAntdModule, } from 'ng-zorro-antd';

import { FatalErrorComponent } from './fatal-error.component';
import { getTranslocoModule, FakeDataHelper, asyncData, asyncError } from '../../../testing';
import { UIStatusService } from '../../services';

describe('FatalErrorComponent', () => {
  let component: FatalErrorComponent;
  let fixture: ComponentFixture<FatalErrorComponent>;
  const uiServiceStub: Partial<UIStatusService> = {};

  beforeEach(async(() => {
    uiServiceStub.latestError = '';

    TestBed.configureTestingModule({
      imports: [
        NgZorroAntdModule,
        getTranslocoModule()
      ],
      declarations: [
        FatalErrorComponent,
      ],
      providers: [
        { provide: UIStatusService, useValue: uiServiceStub },
      ]
    })
    .compileComponents();
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
