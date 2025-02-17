import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzImageModule } from 'ng-zorro-antd/image';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { environment } from '@environments/environment';

@Component({
  selector: 'hih-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
  imports: [
    NzGridModule,
    NzDividerModule,
    NzTypographyModule,
    NzCardModule,
    NzImageModule,
    TranslocoModule
  ]
})
export class WelcomeComponent {
  gridFinanceStyle = {
    width: '33%',
    textAlign: 'center',
  };
  constructor(private router: Router) { }

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
  get financeSearchImage(): string {
    return `${environment.AppHost}/assets/img/Finance-search.png`;
  }
  get bookImage(): string {
    return `${environment.AppHost}/assets/img/Book.png`;
  }
  get personImage(): string {
    return `${environment.AppHost}/assets/img/Person.png`;
  }
  get locationImage(): string {
    return `${environment.AppHost}/assets/img/Location.png`;
  }
  get organizationImage(): string {
    return `${environment.AppHost}/assets/img/Organization.png`;
  }
  get borrowRecordsImage(): string {
    return `${environment.AppHost}/assets/img/Borrow-records.png`;
  }
  get bookSearchImage(): string {
    return `${environment.AppHost}/assets/img/Book-search.png`;
  }
  get eventOverviewImage(): string {
    return `${environment.AppHost}/assets/img/Event-overview.png`;
  }
  get eventListImage(): string {
    return `${environment.AppHost}/assets/img/Event.png`;
  }
  get eventRecurListImage(): string {
    return `${environment.AppHost}/assets/img/Event-recur.png`;
  }
  get eventSearchImage(): string {
    return `${environment.AppHost}/assets/img/Event-search.png`;
  }
  get homeImage(): string {
    return `${environment.AppHost}/assets/img/Home.png`;
  }
  onNavigateToHomeList(): void {
    this.router.navigate(['homedef']);
  }
  onNavigateToCurrentHome(): void {
    this.router.navigate(['homedef']);
  }
  onNavigateToOverview(): void {
    this.router.navigate(['finance', 'overview']);
  }
  onNavigateToAccount(): void {
    this.router.navigate(['finance', 'account']);
  }
  onNavigateToDocument(): void {
    this.router.navigate(['finance', 'document']);
  }
  onNavigateToReport(): void {
    this.router.navigate(['finance', 'report']);
  }
  onNavigateToPlan(): void {
    this.router.navigate(['finance', 'plan']);
  }
  onNavigateToConfig(): void {
    this.router.navigate(['finance', 'config']);
  }
  onNavigateToFinanceSearch(): void {
    this.router.navigate(['finance', 'search']);
  }
  onNavigateToLibraryPerson(): void {
    this.router.navigate(['library', 'person']);
  }
  onNavigateToLibraryOrganization(): void {
    this.router.navigate(['library', 'organization']);
  }
  onNavigateToLibraryLocation(): void {
    this.router.navigate(['library', 'location']);
  }
  onNavigateToLibraryBooks(): void {
    this.router.navigate(['library', 'book']);
  }
  onNavigateToLibraryBorrowRecord(): void {
    this.router.navigate(['library', 'borrowrecord']);
  }
  onNavigateToLibrarySearch(): void {
    this.router.navigate(['library', 'search']);
  }
  onNavigateToEventOverview(): void {
    this.router.navigate(['event', 'overview']);
  }
  onNavigateToEventList(): void {
    this.router.navigate(['event', 'normal-event']);
  }
  onNavigateToEventRecurList(): void {
    this.router.navigate(['event', 'recur-event']);
  }
  onNavigateToEventSearch(): void {
    this.router.navigate(['event', 'search']);
  }
}
