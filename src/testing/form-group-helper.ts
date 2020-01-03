import { FormGroup, ValidationErrors } from '@angular/forms';
import { SequenceList } from 'actslib';

export interface IFormGroupError {
  key: string;
  error: string;
  errorValue: string;
}

export class FormGroupHelper {
  public static getFormGroupError(formGroup: FormGroup): SequenceList<IFormGroupError> {
    const listErrors = new SequenceList<IFormGroupError>();
    Object.keys(formGroup.controls).forEach(key => {
      const controlErrors: ValidationErrors = formGroup.get(key).errors;
      if (controlErrors != null) {
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
