import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgZorroAntdModule, NZ_I18N, en_US, } from 'ng-zorro-antd';

import { FatalErrorComponent } from './fatal-error.component';

describe('FatalErrorComponent', () => {
  let component: FatalErrorComponent;
  let fixture: ComponentFixture<FatalErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [NgZorroAntdModule],
      declarations: [ FatalErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FatalErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
