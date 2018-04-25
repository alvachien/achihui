import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectByCategoryComponent } from './object-by-category.component';

describe('ObjectByCategoryComponent', () => {
  let component: ObjectByCategoryComponent;
  let fixture: ComponentFixture<ObjectByCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ObjectByCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ObjectByCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
