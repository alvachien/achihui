import { Input, Directive } from "@angular/core";

@Directive({
  // eslint-disable-next-line @angular-eslint/directive-selector
  selector: "[routerLink]",
  // eslint-disable-next-line @angular-eslint/no-host-metadata-property
  host: { "(click)": "onClick()" },
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class RouterLinkDirectiveStub {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  @Input("routerLink") linkParams: any;
  navigatedTo = null;

  onClick(): void {
    this.navigatedTo = this.linkParams;
  }
}
