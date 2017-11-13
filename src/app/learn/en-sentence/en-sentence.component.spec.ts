import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnSentenceComponent } from './en-sentence.component';

describe('EnSentenceComponent', () => {
  let component: EnSentenceComponent;
  let fixture: ComponentFixture<EnSentenceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnSentenceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnSentenceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
