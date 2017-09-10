import {
  Component, OnInit, OnDestroy, AfterViewInit, EventEmitter,
  Input, Output, ViewContainerRef,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from '../../../environments/environment';
import { LogLevel, Account, UIMode } from '../../model';
import { HomeDefDetailService, FinanceStorageService } from '../../services';

@Component({
  selector: 'app-account-detail',
  templateUrl: './account-detail.component.html',
  styleUrls: ['./account-detail.component.scss'],
})
export class AccountDetailComponent implements OnInit {

  private routerID: number = -1; // Current object ID in routing
  public currentMode: string;
  public detailObject: Account = null;
  public uiMode: UIMode = UIMode.Create;
  public step: number = 0;

  constructor(private _router: Router,
    private _activateRoute: ActivatedRoute,
    private _homedefService: HomeDefDetailService,
    public _storageService: FinanceStorageService) {
  }

  ngOnInit() {
    if (environment.LoggingLevel >= LogLevel.Debug) {
      console.log('AC_HIH_UI [Debug]: Entering AccountDetailComponent ngOnInit...');
    }

    // Distinguish current mode
    this._activateRoute.url.subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Entering AccountDetailComponent ngOnInit for activateRoute URL: ${x}`);
        }

        if (x instanceof Array && x.length > 0) {
        if (x[0].path === 'create') {
          this.currentMode = 'Common.Create';
          this.detailObject = new Account();
          this.uiMode = UIMode.Create;
          this.detailObject.HID = this._homedefService.ChosedHome.ID;
        } else if (x[0].path === 'edit') {
          this.routerID = +x[1].path;

          this.currentMode = 'Common.Edit';
          this.uiMode = UIMode.Change;
        } else if (x[0].path === 'display') {
          this.routerID = +x[1].path;

          this.currentMode = 'Common.Display';
          this.uiMode = UIMode.Display;
        }
      }
    }, (error) => {
      if (environment.LoggingLevel >= LogLevel.Error) {
        console.log(`AC_HIH_UI [Error]: Entering ngOnInit in AccountDetailComponent with activateRoute URL : ${error}`);
      }
    }, () => {
    });
  }

  get isFieldChangable(): boolean {
    return this.uiMode === UIMode.Create || this.uiMode === UIMode.Change;
  }

  public setStep(index: number) {
    this.step = index;
  }

  public nextStep() {
    this.step++;
  }

  public prevStep() {
    this.step--;
  }

  public onSubmit() {
    if (this.uiMode === UIMode.Create) {
      this._storageService.createAccountEvent.subscribe((x) => {
        if (environment.LoggingLevel >= LogLevel.Debug) {
          console.log(`AC_HIH_UI [Debug]: Receiving createAccountEvent in AccountDetailComponent with : ${x}`);
        }

        // Navigate back to list view
        if (x) {
          this._router.navigate(['/finance/account']);
        } else {
          // Show error message
          // Todo!!!
        }        
      });
      this._storageService.createAccount(this.detailObject);
    }
  }
}
