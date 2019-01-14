import { UrlSegment, } from '@angular/router';
import { ReplaySubject } from 'rxjs';

/**
 * An ActivateRoute test double with a `url` observable.
 * Use the `setURL()` method to add the next `url` value.
 */
export class ActivatedRouteUrlStub {
  // Use a ReplaySubject to share previous values with subscribers
  // and pump new values into the `url` observable
  private subject: any = new ReplaySubject<UrlSegment[]>();

  /** The mock url observable */
  readonly url: any = this.subject.asObservable();

  constructor(initialUrls?: UrlSegment[]) {
    this.setURL(initialUrls);
  }

  /** Set the url observables's next value */
  setURL(url?: UrlSegment[]): void {
    this.subject.next(url);
  }
}
