import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageHomeListComponent } from './page-home-list.component';

describe('PageHomeListComponent', () => {
  let component: PageHomeListComponent;
  let fixture: ComponentFixture<PageHomeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageHomeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageHomeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
