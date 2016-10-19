import { Component, OnInit, OnDestroy }        from '@angular/core';
import { DebugLogging } from '../app.setting';

@Component({
    selector: 'my-app-home',
    templateUrl: 'app/views/home/home.html'
})

export class HomeComponent implements OnInit {
    constructor() {
        if (DebugLogging) {
            console.log("Entering constructor of HomeComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of HomeComponent");
        }
    }
}
