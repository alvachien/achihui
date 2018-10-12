import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocumentAssetBuyInCreateComponent } from './document-asset-buy-in-create.component';

describe('DocumentAssetBuyInCreateComponent', () => {
  let component: DocumentAssetBuyInCreateComponent;
  let fixture: ComponentFixture<DocumentAssetBuyInCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocumentAssetBuyInCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentAssetBuyInCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
