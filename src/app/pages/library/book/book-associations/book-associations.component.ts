import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { Person, Organization, BookCategory, Location } from '@model/index';

/**
 * Presentational view of a book's many-to-many associations.
 *
 * Renders the five association lists (authors, translators, categories, presses,
 * locations) as stacked sections rather than tabs, so every assignment is visible
 * at once during create/edit. Inputs are read-only lists plus a `disabled` flag;
 * the host owns the selection dialogs and reacts to the `assignX` / `removeX`
 * events emitted here.
 */
@Component({
  selector: 'hih-book-associations',
  templateUrl: './book-associations.component.html',
  styleUrls: ['./book-associations.component.less'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslocoModule, NzButtonModule, NzTableModule, NzDividerModule],
})
export class BookAssociationsComponent {
  /** True when the host form is not editable (e.g. Display mode). */
  readonly disabled = input<boolean>(false);

  readonly authors = input<readonly Person[]>([]);
  readonly translators = input<readonly Person[]>([]);
  readonly categories = input<readonly BookCategory[]>([]);
  readonly presses = input<readonly Organization[]>([]);
  readonly locations = input<readonly Location[]>([]);

  // Assignment (open selection dialog) requests, delegated to the host.
  readonly assignAuthor = output<void>();
  readonly assignTranslator = output<void>();
  readonly assignCategory = output<void>();
  readonly assignPress = output<void>();
  readonly assignLocation = output<void>();

  // Removal requests: the host mutates the corresponding list.
  readonly removeAuthor = output<number>();
  readonly removeTranslator = output<number>();
  readonly removeCategory = output<number>();
  readonly removePress = output<number>();
  readonly removeLocation = output<number>();
}
