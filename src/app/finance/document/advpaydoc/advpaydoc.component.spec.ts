/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { AdvpaydocComponent } from './advpaydoc.component';

describe('AdvpaydocComponent', () => {
  let component: AdvpaydocComponent;
  let fixture: ComponentFixture<AdvpaydocComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdvpaydocComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdvpaydocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
