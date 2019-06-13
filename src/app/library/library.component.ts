import { Component, OnInit } from '@angular/core';
import { slideInAnimation } from '../utility';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'hih-library',
  template: `
  <div [@routeAnimations]="prepareRoute(o)">
    <router-outlet #o="outlet"></router-outlet>
  </div>
  `,
  animations: [ slideInAnimation ],
})
export class LibraryComponent {

  constructor() {
    // Empty
  }
  public prepareRoute(outlet: RouterOutlet): any {
    return outlet && outlet.activatedRouteData && outlet.activatedRouteData['animation'];
  }
}
