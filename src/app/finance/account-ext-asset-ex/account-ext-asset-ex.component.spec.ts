import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountExtAssetExComponent } from './account-ext-asset-ex.component';

describe('AccountExtAssetExComponent', () => {
  let component: AccountExtAssetExComponent;
  let fixture: ComponentFixture<AccountExtAssetExComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountExtAssetExComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountExtAssetExComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
