import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranTypeReportComponent } from './tran-type-report.component';

describe('TranTypeReportComponent', () => {
  let component: TranTypeReportComponent;
  let fixture: ComponentFixture<TranTypeReportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TranTypeReportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TranTypeReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
