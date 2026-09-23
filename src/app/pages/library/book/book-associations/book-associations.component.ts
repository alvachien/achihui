import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslocoModule } from '@jsverse/transloco';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTreeSelectModule } from 'ng-zorro-antd/tree-select';
import { NzTreeNodeOptions } from 'ng-zorro-antd/tree';
import { Person, Organization, BookCategory, Location } from '@model/index';
import { SafeAny } from '@common/any';

/**
 * Presentational view of a book's many-to-many associations.
 *
 * Renders the five association lists (authors, translators, categories, presses,
 * locations) as stacked sections rather than tabs, so every assignment is visible
 * at once during create/edit. Inputs are read-only lists plus a `disabled` flag;
 * the host owns the selection dialogs (authors/translators/presses/locations) and
 * the row data, and reacts to the `assignX` / `removeX` events emitted here.
 * Categories are the exception: no dialog — `assignCategory` asks the host to
 * append a blank inline row and each row carries a tree-select that reports its
 * pick through `categoryPicked`.
 */
@Component({
  selector: 'hih-book-associations',
  templateUrl: './book-associations.component.html',
  styleUrls: ['./book-associations.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, NzButtonModule, NzTableModule, NzDividerModule, NzTreeSelectModule, FormsModule],
})
export class BookAssociationsComponent {
  /** True when the host form is not editable (e.g. Display mode). */
  readonly disabled = input<boolean>(false);

  readonly authors = input<readonly Person[]>([]);
  readonly translators = input<readonly Person[]>([]);
  readonly categories = input<readonly BookCategory[]>([]);
  readonly presses = input<readonly Organization[]>([]);
  readonly locations = input<readonly Location[]>([]);

  /** Selectable category tree for the inline tree-select rows (built by the host). */
  readonly categoryTree = input<NzTreeNodeOptions[]>([]);

  // Assignment requests, delegated to the host: the person/organization/location
  // ones open a selection dialog, `assignCategory` appends a blank inline row.
  readonly assignAuthor = output<void>();
  readonly assignTranslator = output<void>();
  readonly assignCategory = output<void>();
  readonly assignPress = output<void>();
  readonly assignLocation = output<void>();

  // A row's tree-select picked `key` (the category ID as a string, null when
  // cleared): the host resolves it against the cached dictionary and replaces `row`.
  readonly categoryPicked = output<{ key: string | null; row: BookCategory }>();

  // Removal requests: the host mutates the corresponding list. Categories are
  // removed by ROW IDENTITY (blank, not-yet-picked rows all share ID 0); the
  // dialog-backed lists keep their unique-ID contract.
  readonly removeAuthor = output<number>();
  readonly removeTranslator = output<number>();
  readonly removeCategory = output<BookCategory>();
  readonly removePress = output<number>();
  readonly removeLocation = output<number>();

  onCategoryPick(key: SafeAny, row: BookCategory): void {
    this.categoryPicked.emit({ key: (key as string | null) ?? null, row });
  }

  // Caps the dropdown: the tree-select panel otherwise grows to fit every node
  // (its own CSS only gives it overflow:auto) and a deep category tree pushes it
  // off-screen. Rows start collapsed; users expand what they need.
  readonly categoryDropdownStyle: { [key: string]: string } = { 'max-height': '300px', overflow: 'auto' };
}
