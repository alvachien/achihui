import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TranTypeTreeComponent } from './tran-type-tree.component';

describe('TranTypeTreeComponent', () => {
  let component: TranTypeTreeComponent;
  let fixture: ComponentFixture<TranTypeTreeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TranTypeTreeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TranTypeTreeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
