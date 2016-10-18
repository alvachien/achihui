import { Component, OnInit, OnDestroy } from '@angular/core';
import { DebugLogging } from '../app.setting';

@Component({
    selector: 'hih-home-lang',
    templateUrl: 'app/views/home/userdetail.html'
})

export class UserDetailComponent implements OnInit, OnDestroy {
    constructor() {
        if (DebugLogging) {
            console.log("Entering constructor of UserDetailComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering constructor of UserDetailComponent");
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of UserDetailComponent");
        }
    }
}
