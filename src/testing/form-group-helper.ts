import { UntypedFormGroup, ValidationErrors } from '@angular/forms';
import { SequenceList } from 'actslib';

export interface IFormGroupError {
  key: string;
  error: string;
  errorValue: string;
}

export class FormGroupHelper {
  public static getFormGroupError(formGroup: UntypedFormGroup): SequenceList<IFormGroupError> {
    const listErrors = new SequenceList<IFormGroupError>();
    if (formGroup.errors !== null) {
      const controlErrors: ValidationErrors = formGroup.errors;
      Object.keys(controlErrors).forEach(keyError => {
        listErrors.AppendElement({
          key: 'formGroup',
          error: keyError,
          errorValue: controlErrors[keyError]
        } as IFormGroupError);
      });
    }

    Object.keys(formGroup.controls).forEach(key => {
      const controlErrors: ValidationErrors | null | undefined = formGroup.get(key)?.errors;
      if (controlErrors) {
        Object.keys(controlErrors).forEach(keyError => {
          listErrors.AppendElement({
            key,
            error: keyError,
            errorValue: controlErrors[keyError]
          } as IFormGroupError);
        });
      }
    });

    return listErrors;
  }
}
