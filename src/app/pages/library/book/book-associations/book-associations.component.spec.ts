import { ComponentFixture, TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { BookCategory } from '@model/index';

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

  it('emits removeCategory with the row object (identity, not id)', () => {
    const spy = vi.fn();
    const row = new BookCategory();
    row.ID = 42;
    component.removeCategory.subscribe(spy);
    component.removeCategory.emit(row);
    expect(spy).toHaveBeenCalledWith(row);
  });

  it('onCategoryPick emits the picked key together with its row', () => {
    const spy = vi.fn();
    const row = new BookCategory();
    component.categoryPicked.subscribe(spy);
    component.onCategoryPick('7', row);
    expect(spy).toHaveBeenCalledWith({ key: '7', row });
    component.onCategoryPick(null, row);
    expect(spy).toHaveBeenCalledWith({ key: null, row });
  });

  it('renders one inline tree-select per category row (no selection dialog)', () => {
    fixture.componentRef.setInput('categories', [
      { ID: 5, Name: 'Sys.BkCtgy.Science' },
      { ID: 6, Name: 'Sys.BkCtgy.Art' },
    ] as unknown as BookCategory[]);
    fixture.detectChanges();

    const selects = fixture.nativeElement.querySelectorAll('nz-tree-select') as NodeListOf<Element>;
    expect(selects.length).toBe(2);
  });

  it('category row has no redundant Name column and never leaks the raw Sys.BkCtgy.* key', () => {
    // The Name (a transloco KEY) must not be rendered next to the tree-select:
    // the select shows the host-translated title, so any raw-key text in the
    // row means the removed Name column came back (or leaked elsewhere).
    const categories = [{ ID: 21, Name: 'Sys.BkCtgy.Computer' }] as unknown as BookCategory[];
    fixture.componentRef.setInput('categories', categories);
    fixture.componentRef.setInput('categoryTree', [{ key: '21', title: 'Computers & Technology(21)' }]);
    fixture.detectChanges();

    // The category row is the only place this component renders tree-selects,
    // so anchor on one - a plain `tbody tr` would hit an empty Authors row.
    const select = fixture.nativeElement.querySelector('nz-tree-select') as HTMLElement;
    expect(select).toBeTruthy();
    const row = select.closest('tr') as HTMLElement;
    expect(row.textContent).toContain('21');
    expect(row.textContent).not.toContain('Sys.BkCtgy');
  });
});
