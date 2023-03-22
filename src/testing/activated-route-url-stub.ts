import { UrlSegment } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * An ActivateRoute test double with a `url` observable.
 * Use the `setURL()` method to add the next `url` value.
 */
export class ActivatedRouteUrlStub {
  // Use a ReplaySubject to share previous values with subscribers
  // and pump new values into the `url` observable
  private subject: BehaviorSubject<UrlSegment[]> | undefined;

  /** The mock url observable */
  get url(): any {
    return this.subject?.asObservable();
  }

  constructor(initialUrls?: UrlSegment[]) {
    this.setURL(initialUrls);
  }

  /** Set the url observables's next value */
  setURL(url?: UrlSegment[]): void {
    this.subject = new BehaviorSubject<UrlSegment[]>(url ?? []);
  }
}
