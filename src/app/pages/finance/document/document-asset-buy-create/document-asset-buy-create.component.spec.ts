import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NgZorroAntdModule, } from 'ng-zorro-antd';

import { DocumentAssetBuyCreateComponent } from './document-asset-buy-create.component';
import { getTranslocoModule } from '../../../../../testing';

describe('DocumentAssetBuyCreateComponent', () => {
  let component: DocumentAssetBuyCreateComponent;
  let fixture: ComponentFixture<DocumentAssetBuyCreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        NgZorroAntdModule,
        getTranslocoModule(),
      ],
      declarations: [ DocumentAssetBuyCreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocumentAssetBuyCreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
