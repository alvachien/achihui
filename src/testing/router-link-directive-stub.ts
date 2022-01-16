import { Input, Directive, } from '@angular/core';

@Directive({
    // eslint-disable-next-line @angular-eslint/directive-selector
    selector: '[routerLink]',
    // eslint-disable-next-line @angular-eslint/no-host-metadata-property
    host: { '(click)': 'onClick()' }
})
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export class RouterLinkDirectiveStub {
    @Input('routerLink') linkParams: any;
    navigatedTo: any = null;

    onClick(): void {
        this.navigatedTo = this.linkParams;
    }
}
