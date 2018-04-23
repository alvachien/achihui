import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SplitterPaneComponent } from './splitter-pane.component';

describe('SplitterPaneComponent', () => {
  let component: SplitterPaneComponent;
  let fixture: ComponentFixture<SplitterPaneComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SplitterPaneComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SplitterPaneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
