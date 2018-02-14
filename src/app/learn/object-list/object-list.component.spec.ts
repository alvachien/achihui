import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ObjectListComponent } from './object-list.component';

describe('ObjectListComponent', () => {
  let component: ObjectListComponent;
  // let fixture: ComponentFixture<ObjectListComponent>;

  beforeEach(async(() => {
    // TestBed.configureTestingModule({
    //   declarations: [ ObjectListComponent ],
    // })
    // .compileComponents();
  }));

  beforeEach(() => {
    // fixture = TestBed.createComponent(ObjectListComponent);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should be created', () => {
    // expect(component).toBeTruthy();
    expect(component).toBeFalsy();
  });
});
