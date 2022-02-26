import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentChangeDespDialogComponent } from './document-change-desp-dialog.component';

describe('DocumentChangeDespDialogComponent', () => {
  let component: DocumentChangeDespDialogComponent;
  let fixture: ComponentFixture<DocumentChangeDespDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentChangeDespDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentChangeDespDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
