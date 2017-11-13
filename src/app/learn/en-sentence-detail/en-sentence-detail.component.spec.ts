import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnSentenceDetailComponent } from './en-sentence-detail.component';

describe('EnSentenceDetailComponent', () => {
  let component: EnSentenceDetailComponent;
  let fixture: ComponentFixture<EnSentenceDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnSentenceDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnSentenceDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
