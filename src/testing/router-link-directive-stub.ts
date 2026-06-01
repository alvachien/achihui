import { input, Directive } from '@angular/core';

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[routerLink]',
    // eslint-disable-next-line @angular-eslint/no-host-metadata-property
    host: { '(click)': 'onClick()' },
    standalone: false
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class RouterLinkDirectiveStub {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  linkParams = input<any>();
  navigatedTo: any = null;

  onClick(): void {
    this.navigatedTo = this.linkParams();
  }
}
