import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TranTypeComponent } from './tran-type.component';

describe('TranTypeComponent', () => {
  let component: TranTypeComponent;
  let fixture: ComponentFixture<TranTypeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TranTypeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TranTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
