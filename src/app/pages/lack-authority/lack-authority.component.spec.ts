import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgZorroAntdModule, } from 'ng-zorro-antd';

import { LackAuthorityComponent } from './lack-authority.component';
import { getTranslocoModule, FakeDataHelper, asyncData, asyncError } from '../../../testing';

describe('LackAuthorityComponent', () => {
  let component: LackAuthorityComponent;
  let fixture: ComponentFixture<LackAuthorityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgZorroAntdModule,
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
