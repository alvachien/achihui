import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentAssetValChgCreateComponent } from './document-asset-valchg-create.component';

describe('DocumentAssetValChgCreateComponent', () => {
  let component: DocumentAssetValChgCreateComponent;
  let fixture: ComponentFixture<DocumentAssetValChgCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentAssetValChgCreateComponent ],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentAssetValChgCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
