import { Component } from '@angular/core';
import { HomeDefDetailService, AuthService, FinanceStorageService, FinCurrencyService } from '../services';

@Component({
    selector: 'hih-learn',
    template: `<router-outlet></router-outlet>`,
})
export class LearnComponent {
    constructor(private _authService: AuthService,
        private _homeDefService: HomeDefDetailService,
        private _storageService: FinanceStorageService,
        private _currService: FinCurrencyService) {
    }
}
