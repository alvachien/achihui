import { Component } from '@angular/core';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'hih-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
})
export class WelcomeComponent {
  gridFinanceStyle = {
    width: '33%',
    textAlign: 'center'
  };
  constructor() { }

  get accountImage(): string {
    return `${environment.AppHost}/assets/img/Accounts.png`;
  }
  get documentImage(): string {
    return `${environment.AppHost}/assets/img/Documents.png`;
  }
  get reportImage(): string {
    return `${environment.AppHost}/assets/img/Reports.png`;
  }
}
