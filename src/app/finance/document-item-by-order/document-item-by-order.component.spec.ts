import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentItemByOrderComponent } from './document-item-by-order.component';

describe('DocumentItemByOrderComponent', () => {
  let component: DocumentItemByOrderComponent;
  let fixture: ComponentFixture<DocumentItemByOrderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentItemByOrderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentItemByOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
