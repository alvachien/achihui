import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzTypographyModule } from 'ng-zorro-antd/typography';

import { HomeDefOdataService } from '@services/index';

@Component({
  selector: 'hih-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [NzGridModule, NzDividerModule, NzTypographyModule, NzCardModule, NzIconModule, DatePipe, TranslocoModule],
})
export class WelcomeComponent {
  private readonly router = inject(Router);
  private readonly homeService = inject(HomeDefOdataService);

  /** Captured once at construction; the page is short-lived and the date rolling
   *  over mid-session is not worth a timer. */
  readonly today = new Date();

  /** nz-card body padding for the launcher tiles (images are gone; the card keeps
   *  its themed background/border from the lazily-swapped light/dark stylesheets). */
  readonly tileBodyStyle = { padding: '16px 20px' };

  // Greeting is a translation KEY (resolved by `| transloco` in the template), so it
  // re-renders correctly when the user switches language mid-session.
  get greetingKey(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Welcome.GoodMorning';
    }
    if (hour < 18) {
      return 'Welcome.GoodAfternoon';
    }
    return 'Welcome.GoodEvening';
  }

  get currentHomeName(): string {
    return this.homeService.ChosedHome?.Name ?? '';
  }

  onNavigateToHomeList(): void {
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
  onNavigateToLibraryReadingRecord(): void {
    this.router.navigate(['library', 'readingrecord']);
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
