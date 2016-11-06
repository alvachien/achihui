import {
    Component, OnInit, OnDestroy, NgZone
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import '../rxjs-operators';
import * as HIHLearn from '../model/learn';
import { DebugLogging } from '../app.setting';
import { DialogService } from '../services/dialog.service';
import { AuthService } from '../services/auth.service';
import { LearnService } from '../services/learn.service';

@Component({
    selector: 'hih-learn-category-list',
    templateUrl: 'app/views/learn/category.list.html'
})
export class CategoryListComponent implements OnInit, OnDestroy {
    public lrnCategories: Array<HIHLearn.LearnCategory>;
    private subLrnCtgy: Subscription;

    constructor(private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        private dialogService: DialogService,
        private learnService: LearnService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of CategoryListComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of CategoryListComponent");
        }

        if (!this.subLrnCtgy) {
            this.subLrnCtgy = this.learnService.category$.subscribe(data => this.getCategories(data),
                error => this.handleError(error));

            this.learnService.loadCategories();
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of Learn.CategoryListComponent");
        }

        if (this.subLrnCtgy) {
            this.subLrnCtgy.unsubscribe();
            this.subLrnCtgy = null;
        }
    }

    getCategories(data: Array<HIHLearn.LearnCategory>) {
        if (DebugLogging) {
            console.log("Entering getCategories of Learn.CategoryListComponent");
        }

        this.zone.run(() => {
            this.lrnCategories = data;
        });
    }

    handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of Learn.CategoryListComponent");
        }
        console.log(error);

        if (error.status === 401) {
            this.dialogService.confirm("Unauthorized! It most likely you input an WRONG access code!");
        }
    }
}
