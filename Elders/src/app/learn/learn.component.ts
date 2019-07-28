import { Component, } from '@angular/core';
import { slideInAnimation } from '../utility';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'hih-learn',
  template: `
  <div [@routeAnimations]="prepareRoute(o)">
    <router-outlet #o="outlet"></router-outlet>
  </div>
  `,
  animations: [ slideInAnimation ],
})
export class LearnComponent  {

  constructor() {
    // Empty
  }
  public prepareRoute(outlet: RouterOutlet): any {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
