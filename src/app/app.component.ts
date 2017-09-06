import { Component, OnInit, ViewContainerRef } from '@angular/core';
import { environment } from '../environments/environment';

@Component({
  selector: 'hih-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  //private isAuthInitial: boolean;

  constructor(viewContainerRef: ViewContainerRef) {
  }

  ngOnInit() {
    if (environment.DebugLogging) {
      console.log("ACHIHUI Log: Entering ngOnInit of AppComponent");
    }
  }
}
