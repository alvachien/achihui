/// Input data passed to selection dialogs via the NZ_MODAL_DATA injection token.
/// NG-ZORRO delivers `nzData` only through this token - it never sets component inputs.
export interface SelectionDlgModalData {
  /// IDs that should appear pre-checked when the dialog opens.
  setOfCheckedId?: Set<number>;
  /// When true, only a single row may be checked at a time.
  singleSelection?: boolean;
}
