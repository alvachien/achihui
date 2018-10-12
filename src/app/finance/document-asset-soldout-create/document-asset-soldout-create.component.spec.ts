import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentAssetSoldoutCreateComponent } from './document-asset-soldout-create.component';

describe('DocumentAssetSoldoutCreateComponent', () => {
  let component: DocumentAssetSoldoutCreateComponent;
  let fixture: ComponentFixture<DocumentAssetSoldoutCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentAssetSoldoutCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentAssetSoldoutCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
