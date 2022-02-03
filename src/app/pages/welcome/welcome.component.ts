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
  get overviewImage(): string {
    return `${environment.AppHost}/assets/img/Overview.png`;
  }
  get planImage(): string {
    return `${environment.AppHost}/assets/img/Plan.png`;
  }
  get configImage(): string {
    return `${environment.AppHost}/assets/img/Config.png`;
  }
  onNavigateToOverview(): void {
    this.router.navigate(['finance', 'overview']);
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
  onNavigateToPlan(): void {
    this.router.navigate(['finance', 'plan']);
  }
  onNavigateToConfig(): void {
    this.router.navigate(['finance', 'config']);
  }
}
