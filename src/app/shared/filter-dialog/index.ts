/**
 * Public surface of the generic filter dialog.
 *
 * Pages configure a `FilterableProperty[]` schema, seed/collect
 * actslib-native `IFilterDefinition`s, and evaluate the emitted definition
 * with `FilterUtility.MatchFilter` — see docs/filter-dialog-generic-design.md.
 */
export * from './filter-dialog-model';
export * from './filter-dialog.component';
export * from './odata-filter';
