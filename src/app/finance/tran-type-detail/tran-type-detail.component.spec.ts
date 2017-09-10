import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TranTypeDetailComponent } from './tran-type-detail.component';

describe('TranTypeDetailComponent', () => {
  let component: TranTypeDetailComponent;
  let fixture: ComponentFixture<TranTypeDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TranTypeDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TranTypeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
