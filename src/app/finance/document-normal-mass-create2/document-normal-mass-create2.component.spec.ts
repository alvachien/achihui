import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentNormalMassCreate2Component } from './document-normal-mass-create2.component';

describe('DocumentNormalMassCreate2Component', () => {
  let component: DocumentNormalMassCreate2Component;
  let fixture: ComponentFixture<DocumentNormalMassCreate2Component>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentNormalMassCreate2Component ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentNormalMassCreate2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
