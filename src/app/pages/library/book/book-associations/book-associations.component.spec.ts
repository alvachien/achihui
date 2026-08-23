import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { getTranslocoModule } from '../../../../../testing';
import { BookAssociationsComponent } from './book-associations.component';

describe('BookAssociationsComponent', () => {
  let component: BookAssociationsComponent;
  let fixture: ComponentFixture<BookAssociationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [getTranslocoModule()],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BookAssociationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('defaults to empty lists and enabled state', () => {
    expect(component.authors()).toEqual([]);
    expect(component.translators()).toEqual([]);
    expect(component.categories()).toEqual([]);
    expect(component.presses()).toEqual([]);
    expect(component.locations()).toEqual([]);
    expect(component.disabled()).toBe(false);
  });

  it('emits assignAuthor when invoked', () => {
    const spy = vi.fn();
    component.assignAuthor.subscribe(spy);
    component.assignAuthor.emit();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('emits removeCategory with the row id', () => {
    const spy = vi.fn();
    component.removeCategory.subscribe(spy);
    component.removeCategory.emit(42);
    expect(spy).toHaveBeenCalledWith(42);
  });
});
