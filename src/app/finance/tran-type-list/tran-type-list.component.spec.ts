import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TranTypeListComponent } from './tran-type-list.component';

describe('TranTypeListComponent', () => {
  let component: TranTypeListComponent;
  let fixture: ComponentFixture<TranTypeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TranTypeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TranTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
