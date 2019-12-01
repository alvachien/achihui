import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DocTypeListComponent } from './doc-type-list.component';

describe('DocTypeListComponent', () => {
  let component: DocTypeListComponent;
  let fixture: ComponentFixture<DocTypeListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DocTypeListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DocTypeListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
