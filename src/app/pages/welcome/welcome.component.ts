import { Component } from '@angular/core';
import { Router } from '@angular/router';
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
  constructor(private router: Router,) { }

  get accountImage(): string {
    return `${environment.AppHost}/assets/img/Accounts.png`;
  }
  get documentImage(): string {
    return `${environment.AppHost}/assets/img/Documents.png`;
  }
  get reportImage(): string {
    return `${environment.AppHost}/assets/img/Reports.png`;
  }
  onNavigateToAccount():void {
    this.router.navigate(['finance', 'account']);
  }
  onNavigateToDocument():void {
    this.router.navigate(['finance', 'document']);
  }
  onNavigateToReport():void {
    this.router.navigate(['finance', 'report']);
  }
}
