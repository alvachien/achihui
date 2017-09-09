import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountCategoryDetailComponent } from './account-category-detail.component';

describe('AccountCategoryDetailComponent', () => {
  let component: AccountCategoryDetailComponent;
  let fixture: ComponentFixture<AccountCategoryDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AccountCategoryDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountCategoryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
