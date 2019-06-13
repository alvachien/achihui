import { Component, HostBinding } from '@angular/core';

@Component({
  selector: 'hih-finance-account',
  template: `<router-outlet></router-outlet>`,
})
export class AccountComponent {
  @HostBinding('@routeAnimation') routeAnimation: boolean = true;

  constructor() {
    // Empty
  }
}
