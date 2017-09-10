import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageInitialComponent } from './page-initial.component';

describe('PageInitialComponent', () => {
  let component: PageInitialComponent;
  let fixture: ComponentFixture<PageInitialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageInitialComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageInitialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
