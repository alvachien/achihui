import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SideNavItemComponent } from './side-nav-item.component';

describe('SideNavItemComponent', () => {
  let component: SideNavItemComponent;
  let fixture: ComponentFixture<SideNavItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SideNavItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SideNavItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
