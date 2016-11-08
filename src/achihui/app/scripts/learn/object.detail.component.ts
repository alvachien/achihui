import {
    Component, OnInit, OnDestroy, NgZone
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import '../rxjs-operators';
import { DebugLogging } from '../app.setting';
import * as HIHLearn from '../model/learn';
import { FinanceService } from '../services/finance.service';
import { DialogService } from '../services/dialog.service';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'hih-learn-object-detail',
    templateUrl: 'app/views/learn/object.detail.html'
})
export class ObjectDetailComponent implements OnInit, OnDestroy {
    public lrnObject: HIHLearn.LearnObject = null;
    public lrnCategories: Array<HIHLearn.LearnCategory>;
    private subObject: Subscription = null;

    constructor(
        private zone: NgZone,
        private route: ActivatedRoute,
        private router: Router,
        private dialogService: DialogService,
        private financeService: FinanceService,
        private authService: AuthService) {
        if (DebugLogging) {
            console.log("Entering constructor of Learn.ObjectDetailComponent");
        }
    }

    ngOnInit() {
        if (DebugLogging) {
            console.log("Entering ngOnInit of Learn.ObjectDetailComponent");
        }
    }

    ngOnDestroy() {
        if (DebugLogging) {
            console.log("Entering ngOnDestroy of Learn.ObjectDetailComponent");
        }
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
}
