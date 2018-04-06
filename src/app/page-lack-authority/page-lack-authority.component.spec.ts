import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PageLackAuthorityComponent } from './page-lack-authority.component';

describe('PageLackAuthorityComponent', () => {
  let component: PageLackAuthorityComponent;
  let fixture: ComponentFixture<PageLackAuthorityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PageLackAuthorityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PageLackAuthorityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
