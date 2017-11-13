import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnWordListComponent } from './en-word-list.component';

describe('EnWordListComponent', () => {
  let component: EnWordListComponent;
  let fixture: ComponentFixture<EnWordListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnWordListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnWordListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
