import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectionDetailComponent } from './collection-detail.component';

describe('CollectionDetailComponent', () => {
  let component: CollectionDetailComponent;
  let fixture: ComponentFixture<CollectionDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CollectionDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CollectionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
