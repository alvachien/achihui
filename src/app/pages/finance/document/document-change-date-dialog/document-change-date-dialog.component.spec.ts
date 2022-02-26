import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentChangeDateDialogComponent } from './document-change-date-dialog.component';

describe('DocumentChangeDateDialogComponent', () => {
  let component: DocumentChangeDateDialogComponent;
  let fixture: ComponentFixture<DocumentChangeDateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DocumentChangeDateDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentChangeDateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
