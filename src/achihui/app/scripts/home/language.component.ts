import { Component, OnInit, OnDestroy, NgZone } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import '../rxjs-operators';
import { DebugLogging } from '../app.setting';
import * as HIHBase from '../model/common';
import { UtilService } from '../services/util.service';

@Component({
    selector: 'hih-home-lang',
    templateUrl: 'app/views/home/language.html'
})

export class LanguageComponent implements OnInit, OnDestroy {
    public arLanguages: Array<HIHBase.AppLanguage>;
    private subLang: Subscription;

    constructor(private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        private utilService: UtilService) {
        if (DebugLogging) {
            console.log("Entering constructor of LanguageComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of LanguageComponent");
        }

        if (!this.subLang) {
            this.subLang = this.utilService.languages$.subscribe(data => this.loadLanguages(data),
                error => this.handleError(error));

            this.utilService.loadLanguages();
        }
    }
    
    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of LanguageComponent");
        }
    }

    loadLanguages(data: Array<HIHBase.AppLanguage>) {
        if (DebugLogging) {
            console.log("Entering loadLanguages of LanguageComponent");
        }

        this.zone.run(() => {
            this.arLanguages = data;
        });
    }

    handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of LanguageComponent");
        }
        console.log(error);
        // Todo?
    }
}
