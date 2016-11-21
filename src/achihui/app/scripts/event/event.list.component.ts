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

    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        private dialogService: DialogService,
        private eventService: EventService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of Learn.EventListComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of Learn.EventListComponent");
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of Learn.EventListComponent");
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
