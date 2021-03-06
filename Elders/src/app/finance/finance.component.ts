import { Component } from '@angular/core';
import { slideInAnimation } from '../utility';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'hih-finance',
  template: `
    <div [@routeAnimations]="prepareRoute(o)">
      <router-outlet #o="outlet"></router-outlet>
    </div>
    `,
  animations: [ slideInAnimation ],
})
export class FinanceComponent {
  constructor() {
    // Empty
  }
  public prepareRoute(outlet: RouterOutlet): any {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
