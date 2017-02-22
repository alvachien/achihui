/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { TransferdocComponent } from './transferdoc.component';

describe('TransferdocComponent', () => {
  let component: TransferdocComponent;
  let fixture: ComponentFixture<TransferdocComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TransferdocComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TransferdocComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
