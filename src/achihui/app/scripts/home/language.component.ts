import { Component, OnInit, OnDestroy } from '@angular/core';
import { DebugLogging } from '../app.setting';

@Component({
    selector: 'hih-home-lang',
    templateUrl: 'app/views/home/language.html'
})

export class LanguageComponent implements OnInit, OnDestroy {
    constructor() {
        if (DebugLogging) {
            console.log("Entering constructor of LanguageComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering constructor of LanguageComponent");
        }
    }
    
    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of ModuleComponent");
        }
    }
}
