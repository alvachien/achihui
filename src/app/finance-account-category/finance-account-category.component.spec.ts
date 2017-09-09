import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceAccountCategoryComponent } from './finance-account-category.component';

describe('FinanceAccountCategoryComponent', () => {
  let component: FinanceAccountCategoryComponent;
  let fixture: ComponentFixture<FinanceAccountCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FinanceAccountCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FinanceAccountCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
