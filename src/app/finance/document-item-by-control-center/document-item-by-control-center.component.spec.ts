import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentItemByControlCenterComponent } from './document-item-by-control-center.component';

describe('DocumentItemByControlCenterComponent', () => {
  let component: DocumentItemByControlCenterComponent;
  let fixture: ComponentFixture<DocumentItemByControlCenterComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentItemByControlCenterComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentItemByControlCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
