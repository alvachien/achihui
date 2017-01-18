import { NgModule } from '@angular/core';
import { HttpModule, Http } from '@angular/http';
import { TranslateModule, TranslateLoader, TranslateStaticLoader } from "ng2-translate/ng2-translate";
import { TinyMceDirective } from './directives/tinymce.directive';

export function funcHttpFactory(http: Http) {
  return new TranslateStaticLoader(http, '/assets/locales/', '.json');
}

@NgModule({
    imports: [
        TranslateModule.forRoot({
            provide: TranslateLoader,
            useFactory: funcHttpFactory,
            deps: [Http]
        }),
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
