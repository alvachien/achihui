import { Component, HostBinding } from '@angular/core';
import { fadeAnimation } from '../../utility';

@Component({
  selector: 'hih-finance-account',
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./account.component.scss'],
  animations: [fadeAnimation],
})
export class AccountComponent {
  @HostBinding('@routeAnimation') routeAnimation: boolean = true;

  constructor() {
    // Empty
  }
}
