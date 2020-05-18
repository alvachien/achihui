import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentItemViewComponent } from './document-item-view.component';

describe('DocumentItemViewComponent', () => {
  let component: DocumentItemViewComponent;
  let fixture: ComponentFixture<DocumentItemViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentItemViewComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentItemViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
