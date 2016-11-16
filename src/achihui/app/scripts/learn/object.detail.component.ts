import {
    Component, OnInit, OnDestroy, NgZone
} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
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
    private routerId: number;

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

        let aid: number = -1;
        //this.route.params
        //    .switchMap((params: Params) => {
        //        this.routerId = +params['id'];
        //    });
        this.route.url.forEach(value => {
            if (DebugLogging) {
                console.log(value);
            }
        });
        if (this.route.data) {
            if (DebugLogging) {
                console.log(this.route.data);
            }
            this.ActivityID = +this.route.data['uimode'];
        }

        this.lrnObject = new HIHLearn.LearnObject();
        if (this.ActivityID === HIHCommon.UIMode.Create) {
            this.Activity = "Common.Create";
        } else {
            this.route.params.forEach((next: { id: number }) => {
                aid = next.id;
            });
            if (aid !== -1 && aid != this.routerId) {
                this.routerId = aid;
            }

            if (this.ActivityID === HIHCommon.UIMode.Change) {
                this.Activity = "Common.Change";
                this.learnService.loadObject(this.routerId).subscribe(data => {
                    this.zone.run(() => {
                        this.lrnObject.onSetData(data);
                    });
                });
            }
            else {
                this.Activity = "Common.Display";
                this.learnService.loadObject(this.routerId).subscribe(data => {
                    this.zone.run(() => {
                        this.lrnObject.onSetData(data);
                    });
                });
            }
        }
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

    private registerObject() {
        if (!this.subObject) {
            this.subObject = this.learnService.objectdetail$.subscribe(
                data => {
                    this.dialogService.log("Object created/changed successfully!");
                },
                error => {
                    this.dialogService.log("Object created/changed failed!");
                },
                () => {
                    this.unregisterObject();
                }
            )
        }
    }

    private unregisterObject() {
        if (this.subObject) {
            this.subObject.unsubscribe();
            this.subObject = null;
        }
    }

    onSubmit($event) {
        if (DebugLogging) {
            console.log("Entering onSubmit of Learn.ObjectDetailComponent");
        }

        // Perform the checks on the UI
        this.registerObject();
        if (this.ActivityID === HIHCommon.UIMode.Create) {
            this.learnService.createObject(this.lrnObject);
        } else if (this.ActivityID === HIHCommon.UIMode.Change) {

        }
    }
}
