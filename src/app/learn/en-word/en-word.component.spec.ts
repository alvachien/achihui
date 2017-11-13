import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnWordComponent } from './en-word.component';

describe('EnWordComponent', () => {
  let component: EnWordComponent;
  let fixture: ComponentFixture<EnWordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EnWordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnWordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
