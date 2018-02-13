import { Component, OnInit, HostBinding } from '@angular/core';
import { fadeAnimation } from '../../utility';

@Component({
  selector: 'hih-finance-account',
  template: `<router-outlet></router-outlet>`,
  styleUrls: ['./account.component.scss'],
  animations: [fadeAnimation],
})
export class AccountComponent implements OnInit {
  @HostBinding('@routeAnimation') routeAnimation: boolean = true;

  constructor() {
    // Empty
  }

  ngOnInit(): void {
    // Emptyu
  }
}
