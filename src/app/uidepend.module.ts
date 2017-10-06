import { NgModule, ModuleWithProviders, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatStepperModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule
} from '@angular/material';
import { CdkTableModule } from '@angular/cdk/table';
import { A11yModule } from '@angular/cdk/a11y';
import { BidiModule } from '@angular/cdk/bidi';
import { OverlayModule } from '@angular/cdk/overlay';
import { PlatformModule } from '@angular/cdk/platform';
import { ObserversModule } from '@angular/cdk/observers';
import { PortalModule } from '@angular/cdk/portal';
import { NgxChartsModule } from '@swimlane/ngx-charts';
import {
    AuthService, AuthGuardService,
    FinCurrencyService, HomeChoseGuardService, FinanceStorageService, LearnStorageService,
    HomeDefDetailService, CanDeactivateGuardService,
} from './services';
import { TinyMceDirective } from './directives/tinymce.directive';

@NgModule({
    imports: [CommonModule],
    declarations: [
        TinyMceDirective,
    ],
    // providers: [
    //     AuthService,
    //     AuthGuardService,
    //     FinCurrencyService,
    //     UserDetailService,
    //     HomeChoseGuardService,
    //     HomeDefDetailService,
    //     CanDeactivateGuardService,
    //     FinanceStorageService,
    //     LearnStorageService,
    // ],
    exports: [
        MatAutocompleteModule,
        MatButtonModule,
        MatButtonToggleModule,
        MatCardModule,
        MatCheckboxModule,
        MatChipsModule,
        MatTableModule,
        MatDatepickerModule,
        MatDialogModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatGridListModule,
        MatIconModule,
        MatInputModule,
        MatListModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressBarModule,
        MatProgressSpinnerModule,
        MatRadioModule,
        MatRippleModule,
        MatSelectModule,
        MatSidenavModule,
        MatSlideToggleModule,
        MatSliderModule,
        MatSnackBarModule,
        MatSortModule,
        MatStepperModule,
        MatTabsModule,
        MatToolbarModule,
        MatTooltipModule,
        MatNativeDateModule,
        CdkTableModule,
        A11yModule,
        BidiModule,
        ObserversModule,
        OverlayModule,
        PlatformModule,
        PortalModule,
        NgxChartsModule,
        TinyMceDirective,
    ],
})
export class UIDependModule {
    // constructor( @Optional() @SkipSelf() parentModule: UIDependModule) {
    //     if (parentModule) {
    //         throw new Error(
    //             'UIDependModule is already loaded. Import it in the AppModule only');
    //     }
    // }

    // static forRoot(): ModuleWithProviders {
    //     return {
    //         ngModule: UIDependModule,
    //         providers: [
    //             AuthService,
    //             AuthGuardService,
    //             FinCurrencyService,
    //             UserDetailService,
    //             HomeChoseGuardService,
    //             HomeDefDetailService,
    //             CanDeactivateGuardService,
    //             FinanceStorageService,
    //             LearnStorageService,
    //         ]
    //     };
    // }
}
