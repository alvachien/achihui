import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentNormalMassCreateItemComponent } from './document-normal-mass-create-item.component';

describe('DocumentNormalMassCreateItemComponent', () => {
  let component: DocumentNormalMassCreateItemComponent;
  let fixture: ComponentFixture<DocumentNormalMassCreateItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentNormalMassCreateItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentNormalMassCreateItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
