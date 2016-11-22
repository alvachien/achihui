import {
    Component, OnInit, OnDestroy, NgZone
} from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Observable }       from 'rxjs/Observable';
import { Subscription }     from 'rxjs/Subscription';
import '../rxjs-operators';
import { DebugLogging }     from '../app.setting';
import * as HIHCommon       from '../model/common';
import * as HIHEvent        from '../model/event';
import { EventService }     from '../services/event.service';
import { DialogService }    from '../services/dialog.service';
import { AuthService }      from '../services/auth.service';
import { BufferService }    from '../services/buffer.service';

@Component({
    selector: 'hih-event-item-detail',
    templateUrl: 'app/views/event/event.detail.html'
})
export class EventDetailComponent implements OnInit, OnDestroy {
    public eventObject: HIHEvent.EventItem = null;
    public Activity: string = "";
    public ActivityID: HIHCommon.UIMode = HIHCommon.UIMode.Create;
    private routerId: number;

    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        private dialogService: DialogService,
        private eventService: EventService,
        private bufferService: BufferService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of Learn.EventDetailComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of Learn.EventDetailComponent");
        }

        this.eventObject = new HIHEvent.EventItem();
        this.eventObject.StartTimepoint = new Date();
        this.eventObject.EndTimepoint = new Date();

        //let aid: number = -1;
        ////this.route.params
        ////    .switchMap((params: Params) => {
        ////        this.routerId = +params['id'];
        ////    });
        //this.route.url.forEach(value => {
        //    if (DebugLogging) {
        //        console.log(value);
        //    }
        //});
        //if (this.route.data) {
        //    if (DebugLogging) {
        //        console.log(this.route.data);
        //    }
        //    this.ActivityID = +this.route.data['uimode'];
        //}

        //this.lrnObject = new HIHLearn.LearnObject();
        //if (this.ActivityID === HIHCommon.UIMode.Create) {
        //    this.Activity = "Common.Create";
        //} else {
        //    this.route.params.forEach((next: { id: number }) => {
        //        aid = next.id;
        //    });
        //    if (aid !== -1 && aid != this.routerId) {
        //        this.routerId = aid;
        //    }

        //    if (this.ActivityID === HIHCommon.UIMode.Change) {
        //        this.Activity = "Common.Change";
        //        this.learnService.loadObject(this.routerId).subscribe(data => {
        //            this.zone.run(() => {
        //                this.lrnObject.onSetData(data);
        //            });
        //        });
        //    }
        //    else {
        //        this.Activity = "Common.Display";
        //        this.learnService.loadObject(this.routerId).subscribe(data => {
        //            this.zone.run(() => {
        //                this.lrnObject.onSetData(data);
        //            });
        //        });
        //    }
        //}
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of Learn.EventDetailComponent");
        }
    }

    private parseDateToStringWithFormat(date: Date): string {
        let result: string;
        let dd = date.getDate().toString();
        let mm = (date.getMonth() + 1).toString();
        let hh = date.getHours().toString();
        let min = date.getMinutes().toString();
        dd = dd.length === 2 ? dd : "0" + dd;
        mm = mm.length === 2 ? mm : "0" + mm;
        hh = hh.length === 2 ? hh : "0" + hh;
        min = min.length === 2 ? min : "0" + min;
        result = [date.getFullYear(), '-', mm, '-', dd, 'T', hh, ':', min].join('');

        return result;
    }

    public set dateTimeStart(v: string) {
        let actualParsedDate = v ? new Date(v) : new Date();
        let normalizedParsedDate = new Date(actualParsedDate.getTime() + (actualParsedDate.getTimezoneOffset() * 60000));
        this.eventObject.StartTimepoint = normalizedParsedDate;
    }

    public get dateTimeStart(): string {
        return this.parseDateToStringWithFormat(this.eventObject.StartTimepoint);
    }

    public set dateTimeEnd(v: string) {
        let actualParsedDate = v ? new Date(v) : new Date();
        let normalizedParsedDate = new Date(actualParsedDate.getTime() + (actualParsedDate.getTimezoneOffset() * 60000));
        this.eventObject.EndTimepoint = normalizedParsedDate;
    }

    public get dateTimeEnd(): string {
        return this.parseDateToStringWithFormat(this.eventObject.EndTimepoint);
    }

    onSubmit(objForm: any) {
        if (this.ActivityID === HIHCommon.UIMode.Create) {
            this.eventService.createEvent(this.eventObject).subscribe(x => {
                console.log("Event created: " + x);
            }, error => {
                console.log("Error occurred: " + error);
            }, () => {
                    console.log("Completed!");
            });
        } else if (this.ActivityID === HIHCommon.UIMode.Change) {

        }
    }
}
