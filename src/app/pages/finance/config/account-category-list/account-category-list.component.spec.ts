import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgZorroAntdModule, } from 'ng-zorro-antd';

import { AccountCategoryListComponent } from './account-category-list.component';
import { getTranslocoModule } from '../../../../../testing';

describe('AccountCategoryListComponent', () => {
  let component: AccountCategoryListComponent;
  let fixture: ComponentFixture<AccountCategoryListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [ 
        NgZorroAntdModule,
        getTranslocoModule(),
      ],
      declarations: [ AccountCategoryListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AccountCategoryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
