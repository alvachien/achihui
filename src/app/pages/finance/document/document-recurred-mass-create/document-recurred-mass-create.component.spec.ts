import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentRecurredMassCreateComponent } from './document-recurred-mass-create.component';

describe('DocumentRecurredMassCreateComponent', () => {
  let component: DocumentRecurredMassCreateComponent;
  let fixture: ComponentFixture<DocumentRecurredMassCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentRecurredMassCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentRecurredMassCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
