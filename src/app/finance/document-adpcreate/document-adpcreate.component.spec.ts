import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentADPCreateComponent } from './document-adpcreate.component';

describe('DocumentADPCreateComponent', () => {
  let component: DocumentADPCreateComponent;
  let fixture: ComponentFixture<DocumentADPCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentADPCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentADPCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
