import { NgModule, ModuleWithProviders, Optional, SkipSelf } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
    MdAutocompleteModule,
    MdButtonModule,
    MdButtonToggleModule,
    MdCardModule,
    MdCheckboxModule,
    MdChipsModule,
    MdDatepickerModule,
    MdDialogModule,
    MdExpansionModule,
    MdFormFieldModule,
    MdGridListModule,
    MdIconModule,
    MdInputModule,
    MdListModule,
    MdMenuModule,
    MdNativeDateModule,
    MdPaginatorModule,
    MdProgressBarModule,
    MdProgressSpinnerModule,
    MdRadioModule,
    MdRippleModule,
    MdSelectModule,
    MdSidenavModule,
    MdSliderModule,
    MdSlideToggleModule,
    MdSnackBarModule,
    MdSortModule,
    MdStepperModule,
    MdTableModule,
    MdTabsModule,
    MdToolbarModule,
    MdTooltipModule,
    StyleModule,
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
        TinyMceDirective
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
        MdAutocompleteModule,
        MdButtonModule,
        MdButtonToggleModule,
        MdCardModule,
        MdCheckboxModule,
        MdChipsModule,
        MdTableModule,
        MdDatepickerModule,
        MdDialogModule,
        MdExpansionModule,
        MdFormFieldModule,
        MdGridListModule,
        MdIconModule,
        MdInputModule,
        MdListModule,
        MdMenuModule,
        MdPaginatorModule,
        MdProgressBarModule,
        MdProgressSpinnerModule,
        MdRadioModule,
        MdRippleModule,
        MdSelectModule,
        MdSidenavModule,
        MdSlideToggleModule,
        MdSliderModule,
        MdSnackBarModule,
        MdSortModule,
        MdStepperModule,
        MdTabsModule,
        MdToolbarModule,
        MdTooltipModule,
        MdNativeDateModule,
        CdkTableModule,
        StyleModule,
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
