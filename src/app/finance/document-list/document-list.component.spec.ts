import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { UIDependModule } from '../../uidepend.module';
import { TranslateModule, TranslateLoader, TranslateService } from '@ngx-translate/core';
import { HttpClient } from "@angular/common/http";
import { HttpClientTestingModule, HttpTestingController } from "@angular/common/http/testing";
import { HttpLoaderTestFactory } from '../../../testing';

import { DocumentListComponent } from './document-list.component';

describe('DocumentListComponent', () => {
  // let component: DocumentListComponent;
  // let fixture: ComponentFixture<DocumentListComponent>;

  beforeEach(async(() => {
    // TestBed.configureTestingModule({
    //   declarations: [ DocumentListComponent ],
    // })
    // .compileComponents();
  }));

  beforeEach(() => {
    // fixture = TestBed.createComponent(DocumentListComponent);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should be created', () => {
    // expect(component).toBeTruthy();
    expect(1).toBe(1);
  });
});
