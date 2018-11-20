import { Component } from '@angular/core';
import { UIStatusService } from '../services';

@Component({
  selector: 'hih-page-fatal-error',
  templateUrl: './page-fatal-error.component.html',
  styleUrls: ['./page-fatal-error.component.scss'],
})
export class PageFatalErrorComponent {
  errorContext: string;

  constructor(private _uiStatus: UIStatusService) {
    this.errorContext = this._uiStatus.latestError;
  }
}
