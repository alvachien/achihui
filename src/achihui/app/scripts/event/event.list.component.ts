import {
    Component, OnInit, OnDestroy, NgZone
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import '../rxjs-operators';
import { DebugLogging } from '../app.setting';
import * as HIHEvent from '../model/event';
import { EventService } from '../services/event.service';
import { DialogService } from '../services/dialog.service';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'hih-event-item-list',
    templateUrl: 'app/views/event/event.list.html'
})
export class EventListComponent implements OnInit, OnDestroy {
    public evtItems: Array<HIHEvent.EventItem> = [];
    public totalCount: number;
    public currentPage: number;
    private itemsPerPage: number;
    public pageCount: number;
    public pageArrays: Array<number>;

    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        private dialogService: DialogService,
        private eventService: EventService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of Event.EventListComponent");
        }

        this.itemsPerPage = 3;
        this.currentPage = 0;
        this.pageCount = 0;
        this.totalCount = 0;
        this.pageArrays = [];
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of Event.EventListComponent");
        }

        this.onPageClick(1);
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of Event.EventListComponent");
        }
    }

    onPagePreviousClick() {
        if (DebugLogging) {
            console.log("Entering onPagePreviousClick of Event.EventListComponent");
        }
        if (this.currentPage > 1) {
            this.currentPage--;
            this.onPageClick(this.currentPage);
        }
    }

    onPageNextClick() {
        if (DebugLogging) {
            console.log("Entering onPageNextClick of Event.EventListComponent");
        }
        if (this.currentPage <= this.pageCount) {
            this.currentPage++;
            this.onPageClick(this.currentPage);
        }
    }

    onPageClick(pageIdx: number) {
        if (DebugLogging) {
            console.log("Entering onPageClick of Event.EventListComponent");
        }

        if (this.currentPage != pageIdx) {
            this.currentPage = pageIdx;

            this.eventService.loadEvents(this.currentPage, this.itemsPerPage).subscribe(data => {
                if (DebugLogging) {
                    console.log("Event loaded successfully of Event.EventListComponent");
                }

                this.totalCount = data.totalCount;
                this.pageCount = Math.ceil(this.totalCount / this.itemsPerPage);
                this.zone.run(() => {
                    this.pageArrays = [];
                    for (let idx = 1; idx <= this.pageCount; idx++) {
                        this.pageArrays.push(idx);
                    }

                    this.evtItems = [];
                    if (data && data.contentList && data.contentList instanceof Array) {
                        for (let cl of data.contentList) {
                            let ei = new HIHEvent.EventItem();
                            ei.onSetData(cl);
                            this.evtItems.push(ei);
                        }
                    }
                });
            }, error => {
                if (DebugLogging) {
                    console.log("Error occurred during event loading of Event.EventListComponent");
                    console.log(error);
                }
            }, () => {
                if (DebugLogging) {
                    console.log("Events loaded completed of Event.EventListComponent");
                }
            });
        }
    }

    newItem() {
        // Navigate to the create page
        this.router.navigate(['/event/create']);
    }

    editItem(row) {
        this.router.navigate(['/event/change', +row.Id]);
    }

    displayItem(row) {
        this.router.navigate(['/event/display', +row.Id]);
    }
}
