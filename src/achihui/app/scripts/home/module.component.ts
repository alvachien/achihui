import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import '../rxjs-operators';
import { DebugLogging } from '../app.setting';
import * as HIHBase from '../model/common';
import { UtilService } from '../services/util.service';

@Component({
    selector: 'hih-home-module',
    templateUrl: 'app/views/home/module.html'
})

export class ModuleComponent implements OnInit, OnDestroy {
    public arModules: Array<HIHBase.Module>;
    private subModule: Subscription;

    constructor(private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        private utilService: UtilService) {
        if (DebugLogging) {
            console.log("Entering constructor of ModuleComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of ModuleComponent");
        }

        if (!this.subModule) {
            this.subModule = this.utilService.moudles$.subscribe(data => this.loadModules(data),
                error => this.handleError(error));

            this.utilService.loadModules();
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of ModuleComponent");
        }
    }

    loadModules(data: Array<HIHBase.Module>) {
        if (DebugLogging) {
            console.log("Entering loadModules of ModuleComponent");
        }

        this.zone.run(() => {
            this.arModules = data;
        });
    }

    handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of ModuleComponent");
        }
        console.log(error);
        // Todo?
    }
}
