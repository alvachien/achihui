import { UrlSegment, } from '@angular/router';
import { ReplaySubject } from 'rxjs';

/**
 * An ActivateRoute test double with a `url` observable.
 * Use the `setURL()` method to add the next `url` value.
 */
export class ActivatedRouteUrlStub {
  // Use a ReplaySubject to share previous values with subscribers
  // and pump new values into the `url` observable
  private subject = new ReplaySubject<UrlSegment[]>();

  constructor(initialUrls?: UrlSegment[]) {
    this.setURL(initialUrls);
  }

  /** The mock url observable */
  readonly url = this.subject.asObservable();

  /** Set the url observables's next value */
  setURL(url?: UrlSegment[]) {
    this.subject.next(url);
  };
}
