import { Component, OnInit, OnDestroy } from '@angular/core';
import { DebugLogging } from '../app.setting';

@Component({
    selector: 'hih-home-module',
    templateUrl: 'app/views/home/module.html'
})

export class ModuleComponent implements OnInit, OnDestroy {
    constructor() {
        if (DebugLogging) {
            console.log("Entering constructor of ModuleComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering constructor of ModuleComponent");
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of ModuleComponent");
        }
    }
}
