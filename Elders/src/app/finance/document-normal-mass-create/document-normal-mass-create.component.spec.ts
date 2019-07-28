import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentNormalMassCreateComponent } from './document-normal-mass-create.component';

describe('DocumentNormalMassCreateComponent', () => {
  let component: DocumentNormalMassCreateComponent;
  let fixture: ComponentFixture<DocumentNormalMassCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentNormalMassCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentNormalMassCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
