import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageFatalErrorComponent } from './page-fatal-error.component';

describe('PageFatalErrorComponent', () => {
  let component: PageFatalErrorComponent;
  let fixture: ComponentFixture<PageFatalErrorComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageFatalErrorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageFatalErrorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
