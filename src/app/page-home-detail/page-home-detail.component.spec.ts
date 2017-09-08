import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageHomeDetailComponent } from './page-home-detail.component';

describe('PageHomeDetailComponent', () => {
  let component: PageHomeDetailComponent;
  let fixture: ComponentFixture<PageHomeDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageHomeDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageHomeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
