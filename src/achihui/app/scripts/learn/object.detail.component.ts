import {
    Component, OnInit, OnDestroy, NgZone
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable }       from 'rxjs/Observable';
import { Subscription }     from 'rxjs/Subscription';
import '../rxjs-operators';
import { DebugLogging }     from '../app.setting';
import * as HIHCommon       from '../model/common';
import * as HIHLearn        from '../model/learn';
import { LearnService }     from '../services/learn.service';
import { DialogService }    from '../services/dialog.service';
import { AuthService }      from '../services/auth.service';
import { BufferService }    from '../services/buffer.service';

@Component({
    selector: 'hih-learn-object-detail',
    templateUrl: 'app/views/learn/object.detail.html'
})
export class ObjectDetailComponent implements OnInit, OnDestroy {
    public lrnObject: HIHLearn.LearnObject = null;
    public lrnCategories: Array<HIHLearn.LearnCategory>;
    public Activity: string = "";
    public ActivityID: HIHCommon.UIMode = HIHCommon.UIMode.Create;

    private subObject: Subscription = null;
    private subCtgy: Subscription;

    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        private dialogService: DialogService,
        private learnService: LearnService,
        private bufferService: BufferService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of Learn.ObjectDetailComponent");
        }

        if (!this.bufferService.isLearnCategoryLoaded) {
            this.subCtgy = this.learnService.category$.subscribe(data => this.getCategories(data),
                error => this.handleError(error));

            this.learnService.loadCategories();
        } else {
            this.getCategories(this.bufferService.lrnCategories);
        }

    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of Learn.ObjectDetailComponent");
        }

        this.Activity = "Common.Create";
        this.lrnObject = new HIHLearn.LearnObject();
        this.lrnObject.Content = "Just a test!";
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of Learn.ObjectDetailComponent");
        }
    }

    getCategories(data: Array<HIHLearn.LearnCategory>) {
        if (DebugLogging) {
            console.log("Entering getCategories of Learn.ObjectDetailComponent");
        }

        this.zone.run(() => {
            this.lrnCategories = data;
        });
    }

    handleError(error: any) {
        if (DebugLogging) {
            console.log("Entering handleError of Learn.ObjectDetailComponent");
        }
        console.log(error);

        if (error.status === 401) {
            this.dialogService.confirm("Unauthorized! It most likely you input an WRONG access code!");
        }
    }

    onEditorKeyup($event) {
        console.log($event);
    }

    onSubmit($event) {

    }
}
