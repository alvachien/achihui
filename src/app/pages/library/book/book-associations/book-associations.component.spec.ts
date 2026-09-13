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

  it('emits removeCategory with the row id', () => {
    const spy = vi.fn();
    component.removeCategory.subscribe(spy);
    component.removeCategory.emit(42);
    expect(spy).toHaveBeenCalledWith(42);
  });

  it('renders assigned category names translated (Name stores a Sys.BkCtgy.* key)', () => {
    // 'Computers & Technology' differs clearly from the key itself, so this
    // fails if the table ever drops the `| transloco` pipe (or vice versa).
    const categories = [{ ID: 21, Name: 'Sys.BkCtgy.Computer' }] as unknown as BookCategory[];
    fixture.componentRef.setInput('categories', categories);
    fixture.detectChanges();

    const cells = fixture.nativeElement.querySelectorAll('td') as NodeListOf<Element>;
    const cellTexts: string[] = Array.from(cells).map((td) => td.textContent?.trim() ?? '');
    expect(cellTexts.some((t) => t.includes('Computers & Technology'))).toBe(true);
    expect(cellTexts.some((t) => t.includes('Sys.BkCtgy'))).toBe(false);
  });
});
