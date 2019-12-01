import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LackAuthorityComponent } from './lack-authority.component';

describe('LackAuthorityComponent', () => {
  let component: LackAuthorityComponent;
  let fixture: ComponentFixture<LackAuthorityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LackAuthorityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LackAuthorityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
