import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgZorroAntdModule, } from 'ng-zorro-antd';

import { TranTypeHierarchyComponent } from './tran-type-hierarchy.component';
import { getTranslocoModule } from '../../../../../testing';

describe('TranTypeHierarchyComponent', () => {
  let component: TranTypeHierarchyComponent;
  let fixture: ComponentFixture<TranTypeHierarchyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgZorroAntdModule,
        getTranslocoModule(),
      ],
      declarations: [ TranTypeHierarchyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TranTypeHierarchyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
