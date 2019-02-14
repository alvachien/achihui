import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountExtADPExComponent } from './account-ext-adpex.component';

describe('AccountExtADPExComponent', () => {
  let component: AccountExtADPExComponent;
  let fixture: ComponentFixture<AccountExtADPExComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountExtADPExComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountExtADPExComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
