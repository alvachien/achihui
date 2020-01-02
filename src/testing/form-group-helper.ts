import { FormGroup, ValidationErrors } from '@angular/forms';

export class FormGroupHelper {
  public getFormGroupError(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach(key => {

      const controlErrors: ValidationErrors = formGroup.get(key).errors;
      if (controlErrors != null) {
        Object.keys(controlErrors).forEach(keyError => {
          console.log('Key control: ' + key + ', keyError: ' + keyError + ', err value: ', controlErrors[keyError]);
        });
      }
    });
  }
}
