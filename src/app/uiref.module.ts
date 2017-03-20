import { NgModule } from '@angular/core';
import { HttpModule, Http } from '@angular/http';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { TinyMceDirective } from './directives/tinymce.directive';

export function funcHttpLoaderFactory(http: Http) {
    return new TranslateHttpLoader(http, '/assets/locales/', '.json');
}

@NgModule({
    imports: [
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: funcHttpLoaderFactory,
                deps: [Http]
            }
        })
    ],
    declarations: [
        TinyMceDirective
    ],
    exports: [
        TinyMceDirective,
        TranslateModule
    ]
})
export class UIRefModule { }
